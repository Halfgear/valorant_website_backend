from pymongo import MongoClient
from pymongo.cursor import CursorType
from pymongo import UpdateOne, DESCENDING, ASCENDING, InsertOne 
import time
import requests
from db_configs import client
from api_configs import request_header
from val_dicts import position_dictionary

val_db = client['valorant']
summary_db = val_db.get_collection('player_summary')
match_id_db = val_db.get_collection('match_ids')
game_data_db = val_db.get_collection('game_data')

seaon_cache = {}

def update_player_summary_db(match):
    requests = []
    total_game_num = 1000
    
    match_info = match['matchInfo']
    players = match['players']
    teams = match['teams']
    queue_id = match_info['queueId']
    if queue_id != 'competitive' and queue_id != 'unrated':
        queue_id = 'Unknown'
    map_id = match_info['mapId']
    weapons = match['weapons']
    team_won = get_team_won(teams)
    s_key = get_seaons_id(match_info['seasonId'])
       
    for player in players:
        team_id = player['teamId']
        player_name = player['gameName']
        player_tag = player['tagLine']
        player_rank = player['competitiveTier']
        puuid = player['puuid']
        character_id = player['characterId']
        account_level = player['accountLevel']
        stats = player['stats']
        damage_stats = player['totalDamageStat']
        rounds_played = stats['roundsPlayed']
        average_combat_score = round(stats['score'] / rounds_played)

        #요원 포지션 확인
        if character_id in position_dictionary:
            agent_position = position_dictionary[character_id]
        else:
            agent_position = None
            
        #무기 정확도 파싱
        player_weapon_stats = weapons.get(puuid, {})
            
        if team_won == 'draw':
            win = 0
            lose = 0
            result = 'draw'
        elif team_id == team_won:
            win = 1
            lose = 0
            result = 'won'
        else:
            win = 0
            lose = 1
            result = 'loss'

        
        #KDA
        kills = stats['kills']
        deaths = stats['deaths']
        assists = stats['assists']
        
        update = {}
        update['$push'] = {
            #result 추가
            'recent_games':{
                '$each':[{
                    'match_id': match['_id'],
                    'character_id': character_id,
                    'position': agent_position,
                    'kills': kills,
                    'deaths': deaths,
                    'assists': assists,
                    'result': result,
                    'average_combat_score': average_combat_score,
                    'timestamp': match_info['gameStartMillis'],
                    'playtimeMilis': stats['playtimeMillis'],
                }],
                '$sort': { 'timestamp': 1 },
                '$slice': -total_game_num
            }
        }
        
        update['$inc'] = {
            f'{s_key}.{queue_id}.counts': 1,
            f'{s_key}.{queue_id}.wins': win,
            f'{s_key}.{queue_id}.losses': lose,
            f'{s_key}.{queue_id}.positions.{agent_position}.counts': 1,
            f'{s_key}.{queue_id}.positions.{agent_position}.wins': win,
            f'{s_key}.{queue_id}.positions.{agent_position}.losses': lose,
            f'{s_key}.{queue_id}.positions.{agent_position}.kills': kills,
            f'{s_key}.{queue_id}.positions.{agent_position}.deaths': deaths,
            f'{s_key}.{queue_id}.positions.{agent_position}.assists': assists,
            f'{s_key}.{queue_id}.positions.{agent_position}.roundsPlayed': rounds_played,
            f'{s_key}.{queue_id}.agents.{character_id}.counts': 1,
            f'{s_key}.{queue_id}.agents.{character_id}.wins': win,
            f'{s_key}.{queue_id}.agents.{character_id}.losses': lose,
            f'{s_key}.{queue_id}.agents.{character_id}.kills': kills,
            f'{s_key}.{queue_id}.agents.{character_id}.deaths': deaths,
            f'{s_key}.{queue_id}.agents.{character_id}.assists': assists,
            f'{s_key}.{queue_id}.agents.{character_id}.roundsPlayed': rounds_played,
            f'{s_key}.{queue_id}.agents.{character_id}.totalAverageCombatScore': average_combat_score,
            f'{s_key}.{queue_id}.maps.{map_id}.counts': 1,
            f'{s_key}.{queue_id}.maps.{map_id}.wins': win,
            f'{s_key}.{queue_id}.maps.{map_id}.losses': lose,
            f'{s_key}.{queue_id}.accuracy.headshots': damage_stats["headshots"],
            f'{s_key}.{queue_id}.accuracy.bodyshots': damage_stats["bodyshots"],
            f'{s_key}.{queue_id}.accuracy.legshots': damage_stats["legshots"],
            f'{s_key}.{queue_id}.totalAverageCombatScore': average_combat_score,
        }
        
        #무기 업데이트
        for weapon, stats in player_weapon_stats.items():
            if not weapon:
                continue
            else:
                update['$inc'].update({
                    f'{s_key}.{queue_id}.weapons.{weapon}.headshots': stats['headshots'],
                    f'{s_key}.{queue_id}.weapons.{weapon}.bodyshots': stats['bodyshots'],
                    f'{s_key}.{queue_id}.weapons.{weapon}.legshots': stats['legshots'],
                    f'{s_key}.{queue_id}.weapons.{weapon}.kills': stats['kills']
                })
        
        #timestamp확인해서 최신티어 확인
        update['$set'] = {
            'tier': player_rank,
            'account_level':account_level,
            f'{s_key}.competitive.tier':player_rank
        }

        # DB에 기존에 존재하던 유저 가져오기
        fields_to_return = {
            'last_game_timestamp': 1,
            'best_tier': 1, 
            f'{s_key}.competitive.best_tier': 1
        }
        current_player = summary_db.find_one({'_id': puuid},fields_to_return)
        
        #티어및 게임 최신화
        if current_player:
            current_season_best_tier = current_player.get(f'{s_key}.competitive.best_tier', '0')
            best_tier = current_player.get('best_tier', '0')

            # 최고티어 확인
            if is_higher_rank(player_rank, current_season_best_tier):
                update['$set'][f'{s_key}.competitive.best_tier'] = player_rank
            if is_higher_rank(player_rank, best_tier):
                update['$set']['best_tier'] = player_rank

            # 최신게임 기준 티어인지 확인
            if match_info['gameStartMillis'] > current_player.get('last_game_timestamp', 0):
                update['$set'].update({
                    'last_game_timestamp': match_info['gameStartMillis'],
                    'tier': player_rank,
                    'account_level':account_level,
                    f'{s_key}.competitive.tier': player_rank
                })
        else:
            update['$set'].update({
                'last_game_timestamp': match_info['gameStartMillis'],
                'tier': player_rank,
                'account_level':account_level,
                f'{s_key}.competitive.tier': player_rank,
                'best_tier': player_rank,
                f'{s_key}.competitive.best_tier': player_rank
            })

        update['$setOnInsert'] = get_set_on_insert_from_match(puuid, player_name, player_tag, s_key)
        req = UpdateOne(filter={'_id': puuid}, update=update, upsert=True)
        requests.append(req)
        
    return requests

def is_higher_rank(new, current):
    return int(new) > int(current)

def get_set_on_insert_from_match(puuid, player_name, player_tag, s_key):
    info = dict()
    info['puuid'] = puuid
    info['player_name'] = player_name
    info['player_tag'] = player_tag
    #이부분 확인 필요
    info['player_name_for_search'] = player_name + '#' + player_tag
    info['last_updated'] = round(time.time() * 1000)
    return info

# 비길 시 두팀다 False로옴: 24a98845-70c5-444a-99bf-5df8b5161d81
def get_team_won(teams):
    if teams[0]["won"]:
        return teams[0]["teamId"]
    elif teams[1]["won"]:
        return teams[1]["teamId"]
    else:
        return 'draw'

def get_seaons_id(season_id, retry_num = 0):
    if season_id not in seaon_cache:
        url = f'https://kr.api.riotgames.com/val/content/v1/contents?locale=en-US'
        response = requests.get(url, headers = request_header)
        api_output = response.json()
        status = response.status_code
        
        if status == 200:
            acts = api_output['acts']
            episode = 0
            current_episode_id = ''
            # 활성화된 에피소드 먼저 찾습니다
            for act in acts:
                if act['type'] == 'episode' and act['isActive'] == True:
                    episode = int(act['name'].split()[-1])
                    current_episode_id = act['id']
            #액트를 찾습니다
            for act in acts:
                if act['type'] == 'act' and act['parentId'] == current_episode_id:
                    act_num = int(act['name'].split()[-1])
                    seaon_cache[act['id']] = 'act'+ str(episode)+'_'+ str(act_num)
                    
            return seaon_cache[season_id]
        
        elif status == 429:
            retry_after = int(response.headers['Retry-After'])
            time.sleep(retry_after)
            retry_num += 1
            return get_seaons_id(season_id, retry_num)
            
        elif retry_num == 20:
            print('Retry limit exceeded', response.status_code, response.headers)
            raise Exception("Retry limit exceeded")
            
        else:
            retry_num += 1
            time.sleep(10)
            return get_seaons_id(season_id, retry_num)
    else:
        return seaon_cache[season_id]

def push_updates_to_db(match):
    update_request = update_player_summary_db(match)
    
    result = summary_db.bulk_write(update_request, ordered=False)

    return result

def main():
    while True:
        try:
            match_id_document = match_id_db.find_one({'match_info': True, 'player_summary': False, 'is_complete': True})
            if match_id_document:
                match_id = match_id_document['_id']
            else:
                print('wait two second because there is no document to process')
                time.sleep(2)
                continue
                
            game_document = game_data_db.find_one({'_id': match_id})
            if game_document:
                # 플레이어 서머리 생성
                player_summary_document = update_player_summary_db(game_document)
                summary_db.bulk_write(player_summary_document, ordered=False)
                # 파싱 진행됐다고 체크
                match_id_db.update_one({'_id': match_id}, {'$set': {'player_summary': True}})
                print(f'Saved player summary for {match_id}')
            else:
                print(f'Failed to find game_document using match_id: {match_id}')
                updated_count = match_id_db.update_one({'_id': match_id}, {'$set': {'match_info': False}}).modified_count
                print(f"Updated {updated_count} documents to set match_info to False.")
                
        except Exception as e:
            print(f"An error occurred: {e}")
            time.sleep(1)
            continue

if __name__ == "__main__":
    main()






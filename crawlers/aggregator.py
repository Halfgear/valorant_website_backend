from statistics import mean
import time
from db_configs import client
val_db = client['valorant']

match_id_db = val_db.get_collection('match_ids')
game_data_db = val_db.get_collection('game_data')
map_agent_db = val_db.get_collection('map_agent_winrate')
map_winrate_db = val_db.get_collection('map_atk_def_winrate')
agent_kda_db = val_db.get_collection('agent_kda')
agent_avs_db = val_db.get_collection('agent_data')

def update_round_results(round_result, blue_team_result_dict, red_team_result_dict):
    team_won = round_result["winningTeam"]
    round_num = round_result["roundNum"]

    if(round_result["roundResultCode"] == "Surrendered"):
        return
    elif(team_won == "Blue" and round_num < 12):
        blue_team_result_dict['DefWin']+=1
        red_team_result_dict['AtkLoss']+=1
    elif(team_won == "Red" and round_num < 12):
        blue_team_result_dict['DefLoss']+=1
        red_team_result_dict['AtkWin']+=1        
    elif(team_won == "Blue" and round_num >= 12):
        blue_team_result_dict['AtkWin']+=1
        red_team_result_dict['DefLoss']+=1      
    elif(team_won == "Red" and round_num >= 12):
        blue_team_result_dict['AtkLoss']+=1
        red_team_result_dict['DefWin']+=1

def update_atk_def_db(agent_list, map_id, team_result_dict, map_agent_db, average_tier):
    for agent in agent_list:
        map_agent_db.update_one(
            {
                "_id.agent": agent,
                "_id.map": map_id,
                "_id.tier":average_tier
            },
            {
                "$inc": {
                    "AttackWin": team_result_dict['AtkWin'],
                    "AttackLoss": team_result_dict['AtkLoss'],
                    "DefenseWin": team_result_dict['DefWin'],
                    "DefenseLoss": team_result_dict['DefLoss'],                                          
                    "Count":1
                }
            },
            upsert=True
        )
        
        #tier 0 는 모든 티어를 의미합니다.
        map_agent_db.update_one(
            {
                "_id.agent": agent,
                "_id.map": map_id,
                "_id.tier": 0
            },
            {
                "$inc": {
                    "AttackWin": team_result_dict['AtkWin'],
                    "AttackLoss": team_result_dict['AtkLoss'],
                    "DefenseWin": team_result_dict['DefWin'],
                    "DefenseLoss": team_result_dict['DefLoss'],                                          
                    "Count":1
                }
            },
            upsert=True
        )
        
def update_map_db(map_id, map_result_dict, map_counter_db, average_tier):
    map_winrate_db.update_one(
        {
            "_id.map": map_id,
            "_id.tier": average_tier
        },
        {
            "$inc": {
                "AttackWin": map_result_dict['AtkWin'],
                "AttackLoss": map_result_dict['AtkLoss'],
                "DefenseWin": map_result_dict['DefWin'],
                "DefenseLoss": map_result_dict['DefLoss'],
                "Count":1
            }
        },
        upsert=True
    )
    
    map_winrate_db.update_one(
        {
            "_id.map": map_id,
            "_id.tier": 0
        },
        {
            "$inc": {
                "AttackWin": map_result_dict['AtkWin'],
                "AttackLoss": map_result_dict['AtkLoss'],
                "DefenseWin": map_result_dict['DefWin'],
                "DefenseLoss": map_result_dict['DefLoss'],
                "Count":1
            }
        },
        upsert=True
    )

IMMORTAL_PLUS = 23
PLAT_PLUS = 14
def get_average_tier(players): 
    tier_list = []
    for player in players:
        tier_list.append(player["competitiveTier"])
    average = round(mean(tier_list))
    if average > IMMORTAL_PLUS:
        return 3
    if average> PLAT_PLUS:
        return 2
    else:
        return 1

def count_winrate_in_document(document):
    map_id = document['matchInfo']['mapId']
    players = document['players']
    round_results = document['roundResults']
    
    average_tier = get_average_tier(players)
    blue_team_result_dict = {'AtkWin': 0, 'AtkLoss': 0, 'DefWin': 0, 'DefLoss': 0}
    red_team_result_dict = {'AtkWin': 0, 'AtkLoss': 0, 'DefWin': 0, 'DefLoss': 0}
    map_result_dict = {'AtkWin': 0, 'AtkLoss': 0, 'DefWin': 0, 'DefLoss': 0}

    blue_agent_list, red_agent_list = initialize_team_dicts(players)

    for round_result in round_results:
        update_round_results(round_result, blue_team_result_dict, red_team_result_dict)
        
    for key in map_result_dict:
        map_result_dict[key] = blue_team_result_dict[key] + red_team_result_dict[key]

    update_map_db(map_id, map_result_dict, map_winrate_db, average_tier)
    update_atk_def_db(blue_agent_list, map_id, blue_team_result_dict, map_agent_db, average_tier)
    update_atk_def_db(red_agent_list, map_id, red_team_result_dict, map_agent_db, average_tier)
    
def initialize_team_dicts(players):
    blue_agent_list = []
    red_agent_list = []
    for player in players:
        if player['teamId'] == 'Blue':
            blue_agent_list.append(player['characterId'])
        else:
            red_agent_list.append(player['characterId'])
    return blue_agent_list, red_agent_list

def agent_acs_in_document(document):
    players = document['players']
    for player in players:
        stats = player['stats']
        acs =int( stats['score']/stats['roundsPlayed'])
        agent_avs_db.update_one({
            "_id": player['characterId']
        },
        {
            "$inc": {
                "TotalAverageCombatScore": acs,
                "Matches": 1
            }
        },
        upsert=True
    )

        
def agent_kda_in_document(document):
    players = document['players']
    map_id = document['matchInfo']['mapId']
    average_tier = get_average_tier(players)
    for player in players:
            agent_kda_db.update_one(
                {
                    "_id.agent": player['characterId'],
                    "_id.map": map_id,
                    "_id.tier": average_tier
                },
                {
                    "$inc": {
                        "Kills": player['stats']['kills'],
                        "Deaths": player['stats']['deaths'],
                        "Assists": player['stats']['assists'],                                
                        "Count":1
                    }
                },
                upsert=True
            )
            agent_kda_db.update_one(
                {
                    "_id.agent": player['characterId'],
                    "_id.map": map_id,
                    "_id.tier": 0
                },
                {
                    "$inc": {
                        "Kills": player['stats']['kills'],
                        "Deaths": player['stats']['deaths'],
                        "Assists": player['stats']['assists'],                                
                        "Count":1
                    }
                },
                upsert=True
            )

def loop_db_count_win_loss():
    for document in match_db.find():
        count_winrate_in_document(document)
        agent_acs_in_document(document)
        agent_kda_in_document(document)
    print("finished looping")
    return


def main():
    while True:
        try:
            match_id_document = match_id_db.find_one({'match_info': True, 'stat_count': False, 'is_complete': True})
            if match_id_document:
                match_id = match_id_document['_id']
            else:
                print('wait two second because there is no document to process')
                time.sleep(2)
                continue
                
            game_document = game_data_db.find_one({'_id': match_id})
            if game_document:
                count_winrate_in_document(game_document)
                agent_acs_in_document(game_document)
                agent_kda_in_document(game_document)
                # 파싱 진행됐다고 체크
                match_id_db.update_one({'_id': match_id}, {'$set': {'stat_count': True}})
                print(f'aggregated data from {match_id}')
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
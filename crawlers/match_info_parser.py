from collections import defaultdict

# ## 무기파싱
def get_weapons_game(players, round_results):
    weapon_dict = defaultdict(lambda: defaultdict(lambda: {'legshots': 0, 'bodyshots': 0, 'headshots': 0, 'kills': 0}))
    
    for round_result in round_results:
        for player_stat in round_result['playerStats']:
            puuid = player_stat['puuid']
            damages = player_stat['damage']
            damage_dict = {}
            for damage in damages:
                damage_dict[damage['receiver']] = {
                    'legshots': damage['legshots'],
                    'bodyshots': damage['bodyshots'],
                    'headshots': damage['headshots'],
                }
            
            for kill in player_stat['kills']:
                finish = kill['finishingDamage']
                victim = kill['victim']
                if finish['damageType'] == 'Weapon':
                    weapon_id = finish['damageItem']
                    try:
                        weapon_dict[puuid][weapon_id]['legshots'] += damage_dict[victim]['legshots']
                        weapon_dict[puuid][weapon_id]['bodyshots'] += damage_dict[victim]['bodyshots']
                        weapon_dict[puuid][weapon_id]['headshots'] += damage_dict[victim]['headshots']
                        weapon_dict[puuid][weapon_id]['kills'] += 1
                    except KeyError:
                        continue
    return dict(weapon_dict)

# ## 클러치파싱
def get_clutches_game(players, round_results):
    red_team = []
    blue_team = []
    for player in players:
        team = player["teamId"]
        if(team == 'Blue'):
            blue_team.append(player["puuid"])
        if(team == 'Red'):
            red_team.append(player["puuid"])

    return get_clutch_dictionary(blue_team, red_team, round_results)


def get_clutch_dictionary(blue_team, red_team, round_results):
    clutch_dict = {}
    clutch_versus = { "5":0, "4":0, "3":0, "2":0, "1":0}
    for blue_player in blue_team:
        clutch_dict[blue_player] = clutch_versus.copy()
    for red_player in red_team:
        clutch_dict[red_player] = clutch_versus.copy()
    
    for round_result in round_results:
        if round_result["roundCeremony"] == 'CeremonyClutch':
            who_clutched(blue_team, red_team, round_result, clutch_dict)
        if round_result["roundCeremony"] == 'CeremonyCloser':
            who_won(blue_team, red_team, round_result, clutch_dict)
    
    return clutch_dict


def who_clutched(blue_team, red_team, round_result, clutch_dict):
    player_stats = round_result["playerStats"]
    # 생존자 카운팅
    alive_blue = set(blue_team)
    alive_red = set(red_team)
    
    # 킬을 전부 가져오고, 시간순대로 정렬합니다
    all_kills = [kill for player_stat in player_stats for kill in player_stat["kills"]]
    all_kills.sort(key=lambda x: x["timeSinceRoundStartMillis"])

    # 킬을 확인하여 죽은 플레이어를 제거해줍니다
    for kill in all_kills:
        victim = kill["victim"]
        if victim in alive_blue:
            alive_blue.remove(victim)
        elif victim in alive_red:
            alive_red.remove(victim)

        # 클러치 상황 체크
        if len(alive_blue) == 1 and len(alive_red) > 1:
            #블루플레이어가 몇명상대로 클러치 한건지 카운트 해줍니다
            clutch_dict[list(alive_blue)[0]][str(len(alive_red))] +=1
            break
            
        
        elif len(alive_red) == 1 and len(alive_blue) > 1:
            clutch_dict[list(alive_red)[0]][str(len(alive_blue))] +=1
            break
    
    #클러치를 찾지 못했다면 세지않고 리턴합니다.
    return clutch_dict

def who_won(blue_team, red_team, round_result, clutch_dict):
    player_stats = round_result["playerStats"]
    team_won = round_result["winningTeam"]
    
    # 킬을 전부 가져오고, 시간순대로 정렬합니다
    all_kills = [kill for player_stat in player_stats for kill in player_stat["kills"]]
    all_kills.sort(key=lambda x: x["timeSinceRoundStartMillis"])
    
    last_kill = all_kills[-1]
    
    clutch_dict[last_kill["killer"]]["1"] +=1
    
    return clutch_dict


# # 에이스 파싱
def get_ace_dict(players, round_results):
    ace_dict = {}
    for player in players:
        ace_dict[player["puuid"]] = 0
    
    for round_result in round_results:
        if round_result["roundCeremony"] == "CeremonyAce":
            player_stats = round_result["playerStats"]
            
            for player_stat in player_stats:
                if len(player_stat["kills"]) == 5:
                    ace_dict[player_stat["puuid"]] += 1
    
    return ace_dict

def get_bomb_stat_dict(players,round_results):
    bomb_dict = {}
    for player in players:
        bomb_dict[player["puuid"]] = {
            'bombPlanted':0,
            'bombDefused':0
        }
    
    for round_result in round_results:
        if round_result['roundResult'] == "Surrendered": return bomb_dict
                
        bomb_planter = round_result.get('bombPlanter')  
        if bomb_planter is not None:
            if bomb_planter in bomb_dict:
                bomb_dict[bomb_planter]['bombPlanted'] += 1

        bomb_defuser = round_result.get('bombDefuser') 
        if bomb_defuser is not None:
            if bomb_defuser in bomb_dict:
                bomb_dict[bomb_defuser]['bombDefused'] += 1
                
    return bomb_dict
        
# # 플레이어스텟 파싱
def extract_player_stats(players, round_results):
    # Initialize dictionaries.
    damage_dict = {player["puuid"]: [] for player in players}
    clutch_dict = get_clutches_game(players, round_results)
    ace_dict = get_ace_dict(players, round_results)
    bomb_dict = get_bomb_stat_dict(players, round_results)
    
    for round_result in round_results:
        for player_stat in round_result["playerStats"]:
            stat_puuid = player_stat["puuid"]
            damage_dict[stat_puuid].append([
                {k: v for k, v in dto.items() if k != 'receiver'} 
                for dto in player_stat["damage"]])
            
    # 파싱한 데미지 리스트를 적어주면서 필요없는 데이터를 버립니다.
    for player in players:
        puuid = player["puuid"]
        player["totalDamageStat"] = condense_damage_list(damage_dict[puuid])
        player["clutch"] = clutch_dict[puuid]
        player["aceCount"] = ace_dict[puuid]
        player["bombCount"] = bomb_dict[puuid]
        del player["playerCard"]
        del player["playerTitle"]
        del player["partyId"]
        
    return players

def condense_damage_list(rounds_damages) -> list:
    total_damage = 0
    leg_shots = 0
    body_shots = 0
    head_shots = 0
    for round_damages in rounds_damages:
        if (len(round_damages) != 0):
            for damage in round_damages:
                total_damage += damage["damage"]
                leg_shots += damage["legshots"]
                body_shots += damage["bodyshots"]
                head_shots += damage["headshots"]
    output = {
        "damage": total_damage,
        "headshots": head_shots,
        "bodyshots": body_shots,
        "legshots": leg_shots
    }
    return output


# # 라운드 결과 파싱

def clean_round_result(round_results):
    for round_result in round_results:
        if (round_result["roundResult"] != "Surrendered"):
            clean_player_stats(round_result.get("playerStats", []))
            for key in ["plantPlayerLocations", "plantLocation", 
                        "defusePlayerLocations", "defuseLocation", 
                        "bombPlanter", "bombDefuser","playerStats"]:
                round_result.pop(key, None)
        else:
            for key in ["plantPlayerLocations", "plantLocation", 
                        "defusePlayerLocations", "defuseLocation", 
                        "bombPlanter", "bombDefuser", "playerStats"]:
                round_result.pop(key, None)
            
    return round_results

def clean_player_stats(player_stats):
    for player_stat in player_stats:
        kills = player_stat["kills"]
        player_stat["kills"] = clean_kills(kills)
        # Aggregating shot statistics
        damage_dict = {
            "headshots": 0,
            "bodyshots": 0,
            "legshots": 0
        }
        for damage in player_stat["damage"]:
            damage_dict["headshots"] += damage["headshots"]
            damage_dict["bodyshots"] += damage["bodyshots"]
            damage_dict["legshots"] += damage["legshots"]

        for key in ["economy", "ability", "damage"]:
            player_stat.pop(key, None)        
            
        player_stat["shotStats"] = damage_dict
        
    return player_stats

def clean_kills(kills):
    cleaned_kills = []
    
    for kill in kills:
        # 자살은 더하지 않습니다. 스파이크 폭발에 죽어도 더하지 않습니다.
        if kill["killer"] == kill["victim"]:
            continue  

        # 데미지입은 경우가 무기였다면 무기아이디도 저장합니다.
        finishing_damage = kill.get("finishingDamage", {})
        if finishing_damage.get("damageType") == "Weapon":
            kill["weaponId"] = finishing_damage.get("damageItem", "Unknown")

        # Remove specified keys
        for key in ["playerLocations", "assistants", "victimLocation", 
                    "timeSinceGameStartMillis", "killer", "finishingDamage"]:
            kill.pop(key, None)

        cleaned_kills.append(kill)

    return cleaned_kills

def parse_match_info(request_output):
    match_info = request_output["matchInfo"]
    match_id = match_info["matchId"]
    version = match_info["gameVersion"].split("-")[1]
    players = request_output["players"]
    round_results = request_output["roundResults"]
    del match_info["matchId"]

    players = extract_player_stats(players, round_results)
    weapons = get_weapons_game(players, round_results)
    round_results = clean_round_result(round_results)

    document = {
        "_id": match_id,
        "matchInfo": match_info,
        "players": players,
        "teams": request_output["teams"],
        "weapons": weapons,
        "roundResults": round_results,
    }
        
    return document
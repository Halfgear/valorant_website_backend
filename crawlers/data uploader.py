from db_configs import client
from val_dicts import map_dictionary
import psycopg2
from psycopg2 import sql
import time

val_db = client['valorant']
map_winrate_db = val_db.get_collection('map_atk_def_winrate')
map_agent_winrate_db = val_db.get_collection('map_agent_winrate')
agent_data = val_db.get_collection('agent_data')
agent_kda_db = val_db.get_collection('agent_kda')


WINRATE_MULTIPLIER = 100
# 요원은 양쪽팀에서 같이 등장할수 있기때문에 *100/2 = 50
PICKRATE_MULTIPLIER = 50
WINRATE_OFFSET = 49.7
WINRATE_POINT_MULTIPLIER = 30
PICKRATE_DIVISOR = 3
low_map_agent_dict = {}
mid_map_agent_dict = {}
high_map_agent_dict = {}
all_map_agent_dict = {}


# # 유틸

def calculate_winrate(win, loss):
    total = win + loss
    return round(win / total * WINRATE_MULTIPLIER, 2) if total else 0

def calculate_pickrate(count, total_count):
    return round(count / total_count * PICKRATE_MULTIPLIER, 2) if total_count else 0

def calculate_ps_score(winrate, pickrate):
    win_rate_point = (winrate - WINRATE_OFFSET) * WINRATE_POINT_MULTIPLIER
    return round(pickrate / PICKRATE_DIVISOR + win_rate_point)

def calculate_ps_tier(psScore):
    if psScore > 100:
        return 0
    if psScore > 35:
        return 1
    if psScore > 18:
        return 2
    if psScore > -3:
        return 3
    return 4

# # 맵 스탯 파싱

def populate_map_dict(tier_id):
    map_dict = {}
    for document in map_winrate_db.find({'_id.tier': tier_id}):
        map_id = document['_id']['map']
        map_dict[map_id] = {
            'count': document['Count']
        }
    return map_dict


# # 맵/요원 스탯 파싱

def populate_map_agent_dict(map_dict):
    map_agent_dict = {}
    for document in map_agent_winrate_db.find():
        map_id = document['_id']['map']
        agent_id = document['_id']['agent']

        if map_id not in map_dict:
            continue

        winrate = calculate_winrate(document['AttackLoss'] + document['DefenseWin'], 
                                    document['AttackLoss'] + document['DefenseLoss'])
        pickrate = calculate_pickrate(document['Count'], map_dict[map_id]['count'])
        psScore = calculate_ps_score(winrate, pickrate)
        tier = calculate_ps_tier(psScore)

        if map_id not in map_agent_dict:
            map_agent_dict[map_id] = {}

        map_agent_dict[map_id][agent_id] = {
            'winRate': winrate,
            'pickRate': pickrate,
            'psScore': psScore,
            'tier': tier
        }
    return map_agent_dict

def create_kda_dict():
    new_kda_dict = {}
    for document in agent_kda_db.find():
        map_id = document['_id']['map']
        agent_id = document['_id']['agent']
        tier = document['_id']['tier']
        
        if map_id is None or agent_id is None or tier is None:
            continue

        count = document['Count']
        kills = round(document['Kills'] / count, 1)
        deaths = round(document['Deaths'] / count, 1)
        assists = round(document['Assists'] / count, 1)

        if map_id not in new_kda_dict:
            new_kda_dict[map_id] = {}
        
        if agent_id not in new_kda_dict[map_id]:
            new_kda_dict[map_id][agent_id] = {}

        new_kda_dict[map_id][agent_id][tier] = {
            'kills': kills,
            'deaths': deaths,
            'assists': assists
        }
    return new_kda_dict

def populate_map_agent_dict_for_tier():
    tier_to_target_dict = {
        0: all_map_agent_dict,
        1: low_map_agent_dict,
        2: mid_map_agent_dict,
        3: high_map_agent_dict
    }

    kda_dict = create_kda_dict()
    
    map_dict = {}
    for tier in [0, 1, 2, 3]:
        map_dict[tier] = populate_map_dict(tier)

    for document in map_agent_winrate_db.find():
        map_id = document['_id']['map']
        agent_id = document['_id']['agent']
        rank_tier = document['_id']['tier']

        if rank_tier not in tier_to_target_dict:
            continue

        target_dict = tier_to_target_dict[rank_tier]
        map_played_count = map_dict[rank_tier][map_id]['count']
        
        winrate = calculate_winrate(document['AttackWin'] + document['DefenseWin'], document['AttackLoss'] + document['DefenseLoss'])
        pickrate = calculate_pickrate(document['Count'], map_played_count)
        psScore = calculate_ps_score(winrate, pickrate)
        tier = calculate_ps_tier(psScore)
        kda = kda_dict.get(map_id, {}).get(agent_id, {}).get(rank_tier, {'kills': 0, 'deaths': 0, 'assists': 0})

        if map_id not in target_dict:
            target_dict[map_id] = {}

        target_dict[map_id][agent_id] = {
            'winRate': winrate,
            'pickRate': pickrate,
            'psScore': psScore,
            'tier': tier,
            'kills': kda['kills'],
            'deaths': kda['deaths'],
            'assists': kda['assists']
        }


# # 맵 공수 승률 계산
def populate_map_winrate_dict():
    map_dict = {}
    for document in map_winrate_db.find({'_id.tier': 0}):
        map_id = document['_id']['map']
        atkWinRate = calculate_winrate(document['AttackWin'], document['AttackLoss'])
        defWinRate = calculate_winrate(document['DefenseWin'], document['DefenseLoss'])
        if atkWinRate == 50.00:
            atkWinRate = 50.01
            defWinRate = 49.99
            
        map_dict[map_id] = {
            'atkWinRate': atkWinRate,
            'defWinRate': defWinRate,
            'count': document['Count']
        }
    return map_dict


# # SQL
def generate_agent_sql_statement(target_dict, tier):
    values = []
    for map_id, agent_stats in target_dict.items():
        for agent_id, stats in agent_stats.items():
            pickrate = stats['pickRate']
            winrate = stats['winRate']
            ps_score = stats['psScore']
            kill = stats['kills']
            death = stats['deaths']
            assist = stats['assists']
            ps_tier = stats['tier']

            values.append(f"({pickrate},{winrate},'{tier}',{ps_score},{ps_tier},{kill},{death},{assist},'{agent_id}','{map_id}')")

    sql_values = ",\n".join(values)
    sql_statement = f"INSERT INTO map_agent_stats (pick_rate, win_rate, tier, ps_score, ps_tier, kill, death, assist, agent_id, map_id) VALUES\n{sql_values};"
    return sql_statement

def generate_map_stats_sql(map_stats_dict):
    values = []
    for map_id, stats in map_stats_dict.items():
        name = map_dictionary[map_id]
        defWinRate = stats['defWinRate']
        atkWinRate = stats['atkWinRate']
        values.append(f"('{name}',{defWinRate},{atkWinRate},'{map_id}')")

    sql_values = ",\n".join(values)
    sql_statement = f"""INSERT INTO map_stats (name, def_win_rate, atk_win_rate, map_id) VALUES
                       {sql_values}
                       ON CONFLICT (map_id) DO UPDATE SET
                       name=EXCLUDED.name, def_win_rate=EXCLUDED.def_win_rate, atk_win_rate=EXCLUDED.atk_win_rate;"""
    return sql_statement

#TODO: your psql param here
psql_db_params = {
    'dbname': '',
    'user': '',
    'password': '',
    'host': '',
    'port': '' 
}

def execute_map_stats_sql():
    map_stats_dict = populate_map_winrate_dict()
    sql_statement = generate_map_stats_sql(map_stats_dict)

    # Connect to the database
    conn = psycopg2.connect(**psql_db_params)
    cur = conn.cursor()

    # Try to insert new data, and update if name already exists
    cur.execute(sql.SQL(sql_statement))
    conn.commit()

    # Close the cursor and connection
    cur.close()
    conn.close()

def execute_agent_sql_statements():
    populate_map_agent_dict_for_tier()

    conn = psycopg2.connect(**psql_db_params)
    cur = conn.cursor()

    cur.execute("DELETE FROM map_agent_stats;")
    cur.execute("ALTER SEQUENCE map_agent_stats_id_seq RESTART WITH 1;")
    all_tier_sql = generate_agent_sql_statement(all_map_agent_dict, 0)
    low_tier_sql = generate_agent_sql_statement(low_map_agent_dict, 1)
    mid_tier_sql = generate_agent_sql_statement(mid_map_agent_dict, 2)
    high_tier_sql = generate_agent_sql_statement(high_map_agent_dict, 3)

    cur.execute(sql.SQL(all_tier_sql))
    cur.execute(sql.SQL(low_tier_sql))
    cur.execute(sql.SQL(mid_tier_sql))
    cur.execute(sql.SQL(high_tier_sql))

    conn.commit()

    cur.close()
    conn.close()

def main():
    while True:
        try:
            execute_agent_sql_statements()
            execute_map_stats_sql()
            print("SQL statements executed. Sleeping for 20 minutes.")
        except Exception as e:
            print(f"An error occurred: {e}. Retrying in 20 minutes.")
        time.sleep(1200)

if __name__ == "__main__":
    main()


import requests
import time
from pymongo.errors import DuplicateKeyError
from db_configs import client
from api_configs import request_header

val_db = client['valorant']
match_id_db = val_db.get_collection('match_ids')

RETRY_LIMIT = 5
def get_recent_comp_match(retry_num = 0):
    if retry_num >= RETRY_LIMIT:
        print('Retry limit exceeded')
        return None

    url = "https://kr.api.riotgames.com/val/match/v1/recent-matches/by-queue/competitive"
    response = requests.get(url, headers=request_header)
    status = response.status_code

    if status == 200:
        return handle_successful_response(response)

    if status == 429:
        return handle_rate_limit(response, retry_num)

    if status == 503:
        return handle_service_error(response, retry_num)

    print('Unhandled error', status, response.headers)
    return get_recent_comp_match(retry_num + 1)


def handle_successful_response(response) -> list:
    match_ids = response.json()["matchIds"]
    inserted_ids = []
    for match_id in match_ids:
        document = {
            '_id': match_id,
            'is_complete': True,
            'match_info': False,
            'player_summary': False,
            'stat_count': False,
        }
        try:
            match_id_db.insert_one(document)
            print(f'Inserted match_id: {match_id}')
            inserted_ids.append(match_id)
            
        except DuplicateKeyError:
            continue
            
    return inserted_ids


def handle_rate_limit(response, retry_num: int):
    retry_after = int(response.headers['Retry-After'])
    time.sleep(retry_after)
    return get_recent_comp_match(retry_num + 1)


def handle_service_error(response, retry_num: int):
    time.sleep(10) 
    return get_recent_comp_match(retry_num + 1)

while True:
    try:
        get_recent_comp_match()
    except Exception as e:
        print(f"An error occurred: {e}")
    time.sleep(1)
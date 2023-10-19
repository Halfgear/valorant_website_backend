import aiohttp
import asyncio
import pymongo
from db_configs import client
from api_configs import request_header
from match_info_parser import parse_match_info

val_db = client['valorant']
collection = val_db.get_collection('game_data')
match_id_db = val_db.get_collection('match_ids')
collection_cache = {}

async def aiohttp_save_match_info_to_db(session, match_id, retry_num=0):
    url = f"https://kr.api.riotgames.com/val/match/v1/matches/{match_id}"
    try:
        async with session.get(url, headers=request_header) as response:   
            status = response.status
            # ok response
            if status == 200:
                content = await response.json()
                match_info = content["matchInfo"]
                if(match_info["isCompleted"]):
                    document = parse_match_info(content)
                    collection.insert_one(document)
                    match_id_db.update_one({'_id': match_id}, {'$set': {'match_info': True}})
                else:
                    match_id_db.update_one({'_id': match_id}, {'$set': {'match_info': False, 'is_complete': False}})
                    print(f'{match_id} is not complete')
                return status

            # Handle Rate limit exceeded
            elif status == 429:
                await asyncio.sleep(int(response.headers['Retry-After']))
                retry_num += 1
                return await aiohttp_save_match_info_to_db(session, match_id, retry_num)

            # Riot Service error
            elif status == 503:
                await asyncio.sleep(10)
                retry_num += 1
                return await aiohttp_save_match_info_to_db(session, match_id, retry_num)

            elif retry_num == RETRY_LIMIT:
                print('Retry limit exceeded', response.status_code, response.headers)
                match_id_db.update_one({'_id': match_id}, {'$set': {'match_info': False}})
                raise Exception("Retry limit exceeded")

            else:
                print('Unhandled error', response.status_code, response.headers)
                retry_num += 1
                match_id_db.update_one({'_id': match_id}, {'$set': {'match_info': False}})
                return await aiohttp_save_match_info_to_db(session, match_id, retry_num)

    except aiohttp.ClientOSError:
        print(f"Aiohttp server Error with {match_id}")
        retry_num += 1
        await asyncio.sleep(5)
        return await aiohttp_save_match_info_to_db(session, match_id, retry_num)

async def main():
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                document = match_id_db.find_one({'match_info': False, 'is_complete': True})
                if document:
                    match_id = document['_id']
                    await aiohttp_save_match_info_to_db(session, match_id)
                    print(f'saved {match_id} doc')
                else:
                    print("No document found where match_info is False")
                    await asyncio.sleep(2)
                    continue

            except Exception as e:
                print(f"An error occurred: {e}")
                continue
                
if __name__ == "__main__":
    asyncio.run(main())
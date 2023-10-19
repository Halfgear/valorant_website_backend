import pymongo
#TODO: put your config
db_config= {
    "user":"",
    "password":"",
    "local_ip":"",
    "port":"",
}
host = "mongodb://{user}:{password}@{local_ip}:{port}".format(**db_config)
client = pymongo.MongoClient(host=host)

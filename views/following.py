from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from views import get_authorized_user_ids

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # return all of the "following" records that the current user is following

        following = Following.query.filter_by(user_id=self.current_user.id).all()
        following_json = [follow.to_dict_following() for follow in following]

        return Response(json.dumps(following_json), mimetype="application/json", status=200)

    def post(self):
        # create a new "following" record based on the data posted in the body 
        body = request.get_json()
        print(body)
        if not body.get('user_id'):
            return Response(json.dumps({"message": "'user_id' is required"}), mimetype="application/json", status=400)
        else:
            if not isinstance(body.get('user_id'), int):
                return Response(json.dumps({"message": "'user_id' is invalid"}), mimetype="application/json", status=400)
            if len(User.query.filter_by(id=body.get('user_id')).all()) == 0:
                return Response(json.dumps({"message": "'user_id' is invalid"}), mimetype="application/json", status=404)

        # 1. Create:
        new_following = Following(
            user_id=self.current_user.id, 
            following_id=body.get('user_id')
        )
        following = Following.query.filter_by(user_id=self.current_user.id).all()
        following_json = [follow.to_dict_following() for follow in following]

        try:
            db.session.add(new_following)    # issues the insert statement
            db.session.commit()         # commits the change to the database 
        except:
            return Response(json.dumps({"message": "following record already exists"}), mimetype="application/json", status=400)

        # insert whatever was posted into the database (and also let's do some validation)
        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "following" record where "id"=id
        print(id)
        following = Following.query.get(id)

        if not id:
            return Response(json.dumps({"message": "'id' is required"}), mimetype="application/json", status=400)
        else:
            if not isinstance(id, int):
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=400)
            if not following:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)
            if following.user_id != self.current_user.id:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)

        Following.query.filter_by(id=id).delete()
        db.session.commit()
        
        return Response(json.dumps({"message": "Following id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)




def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<int:id>', 
        '/api/following/<int:id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

from flask import Response, request
from flask_restful import Resource
from models import LikePost, Post, db
import json
from views import get_authorized_user_ids

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # create a new "like_post" based on the data posted in the body 
        body = request.get_json()
        print(body)

        user_ids = get_authorized_user_ids(self.current_user)

        if not body.get('post_id'):
            return Response(json.dumps({"message": "'post_id' is required"}), mimetype="application/json", status=400)

        if not isinstance(body.get('post_id'), int):
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=400)

        if len(Post.query.filter_by(id=body.get('post_id')).all()) == 0:
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=404)

        post = Post.query.get(body.get('post_id'))
        if post.user_id not in user_ids:
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=404)

        new_like = LikePost(
            user_id=self.current_user.id, 
            post_id=body.get('post_id')
        )

        try:
            db.session.add(new_like)
            db.session.commit()
        except:
            return Response(json.dumps({"message": "bookmark already exists"}), mimetype="application/json", status=400)
            
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "like_post" where "id"=id
        print(id)

        like = LikePost.query.get(id)

        if not id:
            return Response(json.dumps({"message": "'id' is required"}), mimetype="application/json", status=400)
        else:
            if not isinstance(id, int):
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=400)
            if not like:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)
            if like.user_id != self.current_user.id:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)

        LikePost.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message": "Like id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/likes', 
        '/api/posts/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/likes/<int:id>', 
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

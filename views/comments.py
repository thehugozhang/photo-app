from flask import Response, request
from flask_restful import Resource
import json
from models import db, Comment, Post
from views import get_authorized_user_ids

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # create a new "Comment" based on the data posted in the body 
        body = request.get_json()
        user_ids = get_authorized_user_ids(self.current_user)
        print(body)

        if not body.get('post_id'):
            return Response(json.dumps({"message": "'post_id' is required"}), mimetype="application/json", status=400)

        if not body.get('text'):
            return Response(json.dumps({"message": "'text' is required"}), mimetype="application/json", status=400)

        if not isinstance(body.get('post_id'), int):
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=400)

        if len(Post.query.filter_by(id=body.get('post_id')).all()) == 0:
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=404)

        post = Post.query.get(body.get('post_id'))
        if post.user_id not in user_ids:
            return Response(json.dumps({"message": "'post_id' is invalid"}), mimetype="application/json", status=404)

        new_comment = Comment(
            user_id=self.current_user.id, 
            text=body.get('text'),
            post_id=body.get('post_id')
        )

        db.session.add(new_comment)
        db.session.commit()
            
        return Response(json.dumps(new_comment.to_dict()), mimetype="application/json", status=201)

        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    def delete(self, id):
        # delete "Comment" record where "id"=id
        print(id)

        comment = Comment.query.get(id)

        if not id:
            return Response(json.dumps({"message": "'id' is required"}), mimetype="application/json", status=400)
        else:
            if not isinstance(id, int):
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=400)
            if not comment:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)
            if comment.user_id != self.current_user.id:
                return Response(json.dumps({"message": "'id' is invalid"}), mimetype="application/json", status=404)

        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        
        return Response(json.dumps({"message": "Comment id={0} was successfully deleted.".format(id)}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<int:id>', 
        '/api/comments/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

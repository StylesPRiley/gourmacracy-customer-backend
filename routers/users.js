let express = require('express');
let router = express.Router();
let UserSchema = require('../models/users');

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

//Gets all the books
router.get('/', (request, response, next)=>{
    let word = request.query['name'];
    if (result){
        UserSchema
            .find({"name": word})
            .exec( (error, users) =>{
                if (error){
                    response.send({"error": error});
                }else{
                    response.send(users);
                }
            });
    }else{
        UserSchema
            .find()
            .exec( (error, users) =>{
                if (error){
                    response.send({"error": error});
                }else{
                    response.send(users);
                }
            });
    }
});

//Gets the book with the given id (catch error of id not found)
router.get('/:id', (request, response, next) =>{
    UserSchema
        .findById({"_id": request.params.id}, (error, result) => {
            if (error){
                response.status(500).send(error);
            }else if (result){
                response.send(result);
            }else{
                response.status(404).send({"id": request.params.id, "error": "Not Found"});
            }
        });
});

//Insert a book
router.post('/', (request, response, next) =>{
    let userJSON = request.body;
    if (!userJSON.name || !userJSON.email)
       HandleError(response, 'Missing Information', 'Form Data Missing', 500);
    else{
        let user = new UserSchema({
            name: userJSON.name,
            email: userJSON.email,
            password: userJSON.password
        });
        user.save( (error) => {
          if (error){
              response.send({"error": error});
          }else{
              response.send({"id": user.id});
          }
      });
  }
});

//Modifies a book with the given id
router.patch('/:id', (request, response, next) => {
    UserSchema
        .findById(request.params.id, (error, result) => {
            if (error) {
                response.status(500).send(error);
            }else if (result){
                if (request.body._id){
                    delete request.body._id;
                }
                for (let field in request.body){
                    result[field] = request.body[field];
                }
                result.save((error, user)=>{
                    if (error){
                        response.status(500).send(error);
                    }
                    response.send(user);
                });
            }else{
                response.status(404).send({"id": request.params.id, "error":  "Not Found"});
            }
        });
});

//Deletes a book with the given id
router.delete('/:id', (request, response, next) => {
    UserSchema
        .findById(request.params.id, (error, result)=>{
            if (error) {
                response.status(500).send(error);
            }else if (result){
                result.remove((error)=>{
                    if (error){
                        response.status(500).send(error);
                    }
                    response.send({"deletedId": request.params.id});
                });
            }else{
                response.status(404).send({"id": request.params.id, "error":  "Not Found"});
            }
        });
});

module.exports = router;

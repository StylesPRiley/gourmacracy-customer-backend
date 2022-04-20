let express = require('express');
let router = express.Router();
let UserSchema = require('../models/users');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error": message});
}

//Gets all the users
router.get('/', (request, response, next)=>{
    let word = request.query['name'];
    if (word){
        UserSchema
            .find({"email": word})
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

//Gets the user with the given email (catch error of id not found)
router.get('/:email', (request, response, next) =>{
    UserSchema
        .findById({"email": request.params.email}, (error, result) => {
            if (error){
                response.status(500).send(error);
            }else if (result){
                response.send(result);
            }else{
                response.status(404).send({"email": request.params.email, "error": "Not Found"});
            }
        });
});

//Register a User
router.post('/', (request, response, next) =>{
    let userJSON = request.body;
    if (!userJSON.name || !userJSON.email)
       HandleError(response, 'Missing Information', 'Form Data Missing', 500);
    else{
        bcrypt.hash(userJSON.password,10).then((hash) => {
        let user = new UserSchema({
            name: userJSON.name,
            email: userJSON.email,
            password: hash
        });
        user.save( (error) => {
          if (error){
              response.send({"error": error});
          }else{
              response.send({"id": user.id});
          }
      });
    });
  }
});

//Sign-in
router.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
    });
});

//Modifies a user with the given id
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

const express=require('express');
const app=express();
const fs=require("fs");
const multer  = require('multer')


const upload= multer({dest: 'uploads/'});
var session = require('express-session');
app.set("view engine" ,"ejs");
const { Script } = require('vm');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    
  }))


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("Uploads"));

//single means only once file can be uploded
//array means multiple file can be uploaded
//"pic"  is the name of the field in the form
app.use(upload.single("pic"));



app.get("/",(req,res)=>{
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    // res.sendFile(__dirname+"/public/index.html");
    res.render("index",{username:req.session.username,profilePic:req.session.profilePic});
}); 


app.get("/about",(req,res)=>{
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    // res.sendFile(__dirname+"/public/about.html");
    res.render("about",{username:req.session.username,profilePic:req.session.profilePic});
});

app.get("/contact",(req,res)=>{
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    // res.sendFile(__dirname+"/public/contact.html");
    res.render("contact",{username:req.session.username,profilePic:req.session.profilePic});
});

app.get("/todo",(req,res)=>{
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    // res.sendFile(__dirname+"/public/todo.html");
    res.render("todo",{username:req.session.username,profilePic:req.session.profilePic});
});

app.get("/scripts/todoscript.js",(req,res)=>{
    res.sendFile(__dirname+"/scripts/todoscript.js");
});



app.post("/todo",(req,res)=>{
    
    saveAllTodos(req.body,(err)=>{
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })
});
app.get("/todo-data",(req,res)=>{
    readAllTodos((err,data)=>{
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).json(data);
    });
});


app.post("/delTodo",(req,res)=>{
    const idselected = req.body.id;
    
    readAllTodos((err,todo)=>{
        if(err){
            res.status(500).json({result:"failure"})
            return;
        }
        else{   
            todo.forEach((datas,idxs) => {
                if(datas.id=== idselected){
                    todo.splice(idxs,1);
                }
            });
        }
        fs.writeFile("./treasure.mp4" ,JSON.stringify(todo),(err)=>{
            if( err ){
                res.status(500).json({result:'failure W'});
            }
            
            res.status(200).json({result:'success'})
        });
    }); 
});


app.post("/editTodo",(req,res)=>{

    readAllTodos((err,todo)=>{
        if(err){
            res.status(500).json({update:'failed'});
            return;
        }

        const edited = req.body;
        console.log(edited.id);

        todo.forEach((data,idx)=>{
            console.log(data.id);
            if(data.id === edited.id){
                todo[idx].todoText = edited.data;
            }
        });

        fs.writeFile("./treasure.mp4",JSON.stringify(todo),(err)=>{
            if( err ){
                res.status(500).json({ update :'failed'});
            }
            
            res.status(200).json({update:'success'})
        });
    }); 
})

//login
app.get("/login", function (req, res) {
  
    if(req.session.isLoggedIn){
  
      res.redirect("/");
      return;
  }
    res.render("login",{error:null});
  });
  

  app.get('/signup', function(req,res){

    // res.sendFile(__dirname + '/public/signup.html');
    res.render("signup",{error:null});
});
 

app.post("/login", function (req, res) {
     const username = req.body.username;
     const password = req.body.password;
   
     var flag = true;

     fs.readFile( './logs.json', 'utf-8', function(err,data){
        if( err )
        {
            throw err;
        }

        data = JSON.parse(data);
        data.forEach( function( user, idx ){
            if( user.username === username && user.password === password )
            {
                req.session.isLoggedIn=true;
                req.session.user=data;
                req.session.username = username;
                req.session.profilePic=user.profilePic;
                // res.status=200;
                flag = false;
                res.redirect("/");
                return;   
            }
        } );

    if( flag )
     {
        res.render("login",{error:'Invalid User and Password'});
    
     }

     })
 

  })





app.listen(3000,()=>{
    console.log("The app is running at port http://localhost:3000");
});

function readAllTodos(callbacks){
    fs.readFile("./treasure.mp4","utf-8",(err,data)=>{
        if(err){
           callbacks(err);
            return;
        }
        if(data.length===0){
            data="[]";
        }
        try {
        data=JSON.parse(data); 
        callbacks(null,data);
        } 
        catch (err) {
            callbacks(err);
            return;
        }
    });
}
function saveAllTodos(todo,callbacks){
    readAllTodos((err,data)=>{
        if(err){
            callbacks(err);
             return;
         }
         data.push(todo); 
         fs.writeFile("./treasure.mp4",JSON.stringify(data),(err)=>{
            if(err){
                callbacks(err);
                return;
            }
            callbacks(null);
        }); 
    });
}

// Authenticate User
function authenticateUser(username,password,callback){
    readAllUsers((err,data)=>{
     
        if(err){
            callback(err);
            return;
        }
        
            // console.log(data);
            // console.log(username,password)
            for(let i=0;i<data.length;i++){
                if(data[i].username===username && data[i].password===password){
                    callback(null,data[i]);
                    return;
                }
            }
            callback(err);
        
    });
}



function readAllUsers(callback) {
    fs.readFile("./logs.json", "utf-8", function (err, data) {
      if (err) {
        callback(err);
      } else {
        if (data.length == 0) {
          data = "[]";
        }
        try {
          data = JSON.parse(data); // convert string to object
          callback(null, data);
        } catch (err) {
          callback(err);
        }
      }
    });
  }
  
// // save details in file
// function saveDetails(user, callback) {
//     readAllUsers((err, data) => {
//       if(err){
//         callback(err);
//         return;
//     }
//     username=user;
    
//         for(let i=0;i<data.length;i++){
//             if(data[i].user===user.username){
//                 console.log(data[i].user);
//                 callback("user already exists");
//                 return;
//             }
//         }
//         console.log(data);
       
//         console.log(username);
//         // console.log(user);
//         // data.push(user);
//         // k=data.push(user);
//         // console.log(k);
//         // console.log(k);
//         fs.writeFile('./logs.json',JSON.stringify(data),(err)=>{
//             if(err){
//                 callback(err);
//                 return;
//             }
//             callback(null);
//         })
  
    
//     });
//   }
 



app.post("/signup", (req, res) => {

    // Assuming you have a valid 'user' object from the request 
    // const user=req.body;
    const username=req.body.username;
    const password=req.body.password;
    const profilePic=req.file; 

    const user={
        username:username,
        password:password,
        profilePic:profilePic.filename
    }
    // const profilePic=req.body.pic; 
   
    console.log(profilePic);
   

    
    saveDetails(user, (err, flag) => {
      if (err) {
        // Handle the error appropriately, e.g., send an error response
        res.status(500).send("Error occurred");
        return;
      }
  
      // If 'script' is not null, it means the username already exists
    //   if (script) {
    //     res.send(script);
    //     return;
    //   }
    if(flag===false){
        res.render("signup",{error:'user already exit'});
    }
    else{
        res.redirect('/login');

    }

  
      // User details were saved successfully, handle the success response here
    //   res.redirect('/login');
    //   res.send("User details saved successfully!");
    });
  });
  


function saveDetails(user, callback) {
    readAllUsers((err, data) => {
      if (err) {
        callback(err);
        return;
      }
  
      const username = user.username;
      let flag=true;
  
      for (let i = 0; i < data.length; i++) {
        if (data[i].username === username) {
        //   const script = "<script> alert('Invalid User Please try again')  </script>";
        // const flag=true;
        flag=false;
         
          return callback(null, flag);
       
        }
    }
        
        if(flag){
            
    
     
  
    //   console.log(data);
    //   console.log(username);
  
      // Add the new user to the data array
      data.push(user);
  
            fs.writeFile("./logs.json", JSON.stringify(data), (err) => {
                if (err) {
                callback(err);
                return;
                }
                callback(null);
            });
        }
    });
  }

  






  

//  function saveUser( user, callback){
//     getAllUsers(function(err,data){
//     // fs.readFile("./users.apk","utf-8",function(err,data){
//         if(err){
//             callback(err);
//             return;
//         }
//         data.push(user);
        
//         fs.writeFile("./users.apk", JSON.stringify(data),function(err){
//             if(err){
//                 callback(err);
//                 return;
//             }
//             callback(null);
//         })
//     // })
// })
//  }
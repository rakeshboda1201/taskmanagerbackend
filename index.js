const express =require("express");
const jwt=require("jsonwebtoken");
const mysql=require("mysql");
const cors=require("cors");
const bodyParser=require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(cors(
  {
    origin:["https://task-frontend-rouge-eta.vercel.app"],
    methods:["GET","POST","PUT","DELETE"],
    credentials:false
  }
));

let db ;

const initializeDbAndServer = async () => {
  try {
    db= mysql.createConnection({
        host:"localhost",
        user:"root",
        password:"Rakhee@1618",
        database:"taskmanager"
    });
    app.listen(4000, () =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();


app.get("/",(req,res)=>{
  res.json("This is an testing API fot Taskmanager backend.")
})

//Signup API
app.post("/signup",async(req,res)=>{
  try{
  const {username,password}=req.body;

  const q=`select * from customer where username="${username}"`;
  db.query(q,(err,data)=>{
    if(err){
      res.json(err)
    }else{
      if(data[0]===undefined){
        const q2=`insert into customer (username,password) values ("${username}","${password}")`;
        db.query(q2,(err,data)=>{
          if(err){
            res.json(err);
          }else{
            res.json({success_msg:`Successfully registered, your ID is ${data.insertId}`});
          }
        })
      }else{
        res.json({err_msg:"Username already exists"});
      }
    }
  })
  }catch(e){
    res.json(e);
  }
})

//Login API
app.post("/login",async (req,res)=>{
  try{
    const {username,password}=req.body;
    const q=`select * from customer where username="${username}"`;
    db.query(q,(err,data)=>{
      if(err){
        res.json(err)
      }else{
        if(data[0]===undefined){
          res.json({err_msg:"Invalid username"});
        }else{
          if(data[0].password===password){
         const jwt_token=jwt.sign({username,password},"SCRETE_KEY");
         res.json({jwt_token});
          }else{
            res.json({err_msg:"Invalid password"}); 
          }
        }
      }
    })
    }catch(e){
      res.json(e);
    }
})

//Adding new task API
app.post("/addtask",async(req,res)=>{
  const {title,desc,category,status}=req.body
  if(title!=="" && desc!=="" && category!=="" && status!==""){
    const q=`insert into tasks (title,description,category,status) values ("${title}","${desc}","${category}","${status}")`;
    db.query(q,(err,data)=>{
      if(err) return res.json(err)
        return res.json("Task has been succefully added");
    })
  }else{
    res.json("Please fill all fields");
  }
})

//GET all selectall tasks API
app.get("/tasks",async (req,res)=>{
  const q=`select * from tasks`;
  db.query(q,(err,data)=>{
    if(err) return res.json(err);
    return res.json(data);
  })
})

//Delete Task API
app.delete("/tasks/:id", async(req,res)=>{
  const id=req.params.id;
  const q=`select * from tasks where id="${id}"`
  db.query(q,(err,data)=>{
    try{
      if(err){
        res.json(err)
      }else{
        if(data[0]===undefined){
          res.json("Task does not exists");
        }else{
          const q1=`delete from tasks where id="${id}"`;
          db.query(q1,(err,data)=>{
            if(err) {
              res.json(err);
            }else{
              res.json("Task Deleted Succefully");
            }  
          })
        }
      }  
    }catch(e){
       res.json(e);
    }
  })
})

// GET Specific Task API
app.get("/tasks/:id", async(req,res)=>{
  try{
    const {id}=req.params;
    const q=`select * from tasks where id="${id}"`;
    db.query(q,(err,data)=>{
      if(err){
        return res.json(err)
      }else{
        if(data[0]===undefined){
          res.json("Invalid Task ID");
        }else{
          res.json(data)
        }
      }   
    })
  }catch(e){
    res.json(e);
  }
})


//UPDATE task API
app.put("/update-task", async(req,res)=>{
  const {id,title,description,category,status}=req.body;
  const q=`select * from tasks where id="${ id}"`;
  db.query(q,(err,data)=>{
    if(err){
      res.json(err)
    }else{
      if(data===undefined){
        res.json("Invalid ID");
      }else{
        if(data[0]===undefined){
          res.json("Invalid ID");
        }else{
          const q1=`update tasks set title="${title}", description="${description}",category="${category}",status="${status}" where id="${id}"`;
          db.query(q1,(err,data)=>{
            if(err){
              res.json(err);
            }else{
              res.json("Task has been updated successfully");
            }
          })
        }
      }
    }
  })
})

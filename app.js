var express = require("express"),
multer = require("multer"),
app = express(),
bodyParser = require("body-parser"),
mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/data");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//var excel = require("./excel.xls");
var excelToJson = require('convert-excel-to-json');
var Schema = mongoose.Schema;
var storage = multer.memoryStorage();
var upload = multer({dest : 'uploads/'});
var fs = require('fs');

var resultSchema = new Schema({
  hallticket:  String,
  subject_code: String,
  subject_name:   String,
  internal_marks: Number,
  external_marks: Number,
  total_marks: Number,
  credits: Number,
  year: String,

});

var resultsList = new Schema({
  listid: String,
  year: String,
  Regulation:String,
  Paper:String,
  Date:String
});

var results_list = mongoose.model('results_List',resultsList);

app.get("/admin",function(req,res){
  results_list.find({}, function(err, allLists){
    if(err){
        console.log(err);
    } else {
      res.render("admin",{result_data:allLists});
      //console.log(allLists);
    }
 });
});


app.get("/cleardb",function(req,res){
  mongoose.connection.db.dropDatabase('data', function(err, result) {
    if(err)
      console.log(err);
    else
      res.send(result);
  });
});


app.get("/",function(req, res){
  results_list.find({}, function(err, allLists){
     if(err){
         console.log(err);
     } else {
       res.render("menu",{result_data:allLists});
       //console.log(allLists);
     }
  });
});

app.post("/add",upload.array('file'),function(req,res){
  console.log(req.body);
  console.log(req.files);
  
  var collName=req.body.Year+"-"+req.body.Regulation+"-"+req.body.Paper+"-"+'Results'+"-"+req.body.Date;
  let results_model = mongoose.model(collName,resultSchema);  
  var InsertedToList = false;

  req.files.forEach(function(file){
    
    var result = excelToJson({
      sourceFile: file.path ,
      header:{
        // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
        rows: 5 // 2, 3,les);
      },
      columnToKey: {
        A: 'hallticket',
        B: 'subject_code',
        C:'subject_name',
        D:'internal_marks',
        E:'external_marks',
        F:'total_marks',
        G:'credits',
      }
    });

    result.Sheet0.forEach(function(years){
      years.year=req.body.Year;
    });

    console.log(result.Sheet0);
    results_model.insertMany( result.Sheet0 ,function(err){
      if (err) 
        res.send("Error");
      else {
        fs.unlink(file.path, function(error) {
          if (error) {
            console.log(error);
          }
          else {
            console.log('file_Deleted');
            
            if(!InsertedToList){
              results_list.create({
                listid:collName,
                year: req.body.Year,
                Regulation:req.body.Regulation,
                Paper:req.body.Paper,
                date:req.body.Date
              },function(error){
                if (error) {
                  console.log(error);
                }
                 
              });
              InsertedToList = true;
            }
            
          
          }
        });
      }
    });
  });  
  
res.send("success");
console.log("success");
});






app.get("/test/:id", function(req, res){
  console.log(req.params.id);
  res.render("test",{id:req.params.id});        
});

app.post("/test", function(req, res){
 let results_model = mongoose.model(req.body.collection_id,resultSchema);


 results_model.find({'hallticket':req.body.hallticket_no},function (err, member) {
    if(err){
      console.log(err);
    }
    else {
      res.render("test", {student: member,id:req.body.collection_id });
          
    }
  });
});

app.get("/admin/edit",function(req, res){
  results_list.find({}, function(err, allLists){
    if(err){
        console.log(err);
    } else {
      res.render("edit",{result_data:allLists});
      //console.log(allLists);
    }
 });
});


app.get("/admin/edit/:id",function(req, res){
  console.log(req.params.id);
let results_model = mongoose.model(req.params.id,resultSchema);
 results_model.collection.drop();
 let results_list = mongoose.model("results_List",resultsList); 
 results_list.deleteOne({ 'listid': req.params.id }, function (err) {
  if (err) return handleError(err);

});
 res.send("deleted");   
  });
 
app.listen(3000, process.env.IP, function(){
   console.log("Server Has Started!");
});
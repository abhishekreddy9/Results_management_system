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

var results_model = mongoose.model('results', resultSchema);


// results_model.insertMany( result.Sheet0 ,function(err){
//      if (err) 
//    console.log("err");
//    else
//        console.log("Saved!");
//  });

app.get("/admin",function(req,res){
  res.render("admin");
}
);

app.get("/cleardb",function(req,res){
  mongoose.connection.db.dropCollection('results', function(err, result) {
    if(err)
      console.log(err);
    else
      res.send(result);
  });
});

app.post("/add",upload.array('file'),function(req,res){

  console.log(req.body);
  console.log(req.files);
  

  


  req.files.forEach(function(file)
  {
    
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

    result.Sheet0.forEach(function(years)
         {
           years.year=req.body.Year;
          }
          );

     console.log(result.Sheet0);
    results_model.insertMany( result.Sheet0 ,function(err){
        if (err) 
          res.send("Error");
        else {
          fs.unlink(file.path, function(error) {
              if (error) {
                console.log(error);
              }
              console.log('file_Deleted');
              
              
              
              
          });
        }
    });
  }
)





  
});

app.get("/test", function(req, res){
        //if(err){
        //    console.log(member);
           // console.log(err);
       // } else {
         res.render("test");
        
        
});

app.post("/test", function(req, res){
  
     results_model.find({'hallticket':req.body.hallticket_no,'year':req.body.Year},function (err, member) {
        if(err){
      console.log(err);
      }
      else 
      {
        console.log(req.body.hallticket_no);
        console.log(req.body.Year);
        console.log(typeof req.body.Year);
          res.render("test", {student: member });
          
            }
        });
});    



app.listen(3000, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();





app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
                            //localhost     /database name
mongoose.connect("mongodb+srv://admin-fernand:1SOVwkOhMoZihMZ8@cluster0.jfnfw.mongodb.net/todolistDB");

const itemsSchema = {
   name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item = new Item ({
  name: "Welcome to your todolist."
});

const item1 = new Item ({
  name: "Hit the + button to add a new item."
});

const item2 = new Item ({
  name:  "<-- Hit this to delete an item."
});

const defaultItems = [item, item1, item2];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){


  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Succesfully saved default items to the database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });


  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkItemID = req.body.delItem;
  const listName = req.body.listName;

  if (listName == "Today"){
    Item.findByIdAndRemove(checkItemID,function(err){
      if (!err){
        console.log("Succesfully deleted checked item");
          res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
      });
  }



});


//express routing
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);



  const list = new List({
    name: customListName,
    items: defaultItems
  });


  List.findOne({name: customListName},function(err, foundList){
    if (!err){
      if (!foundList){
        //create a new list
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  });




});

let port = process.env.PORT;

if (port == null || port == ""){
  port == 3000;
}

app.listen(port, function(){
  console.log("Server has started succesfully");
});

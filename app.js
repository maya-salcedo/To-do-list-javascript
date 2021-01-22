const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js"); //require the local file module
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public")); 

//connect to mongoose 
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

//make a schema
const itemsSchema = {
    name: String 
};

//make a model based on the schema
const Item = mongoose.model("Item", itemsSchema);

//make mongoose document
const item1 = new Item({
    name: "Bake cookies"
});

const item2 = new Item({
    name: "Go grocery"
});

const item3 = new Item({
    name: "Shovel the snow"
});

//make the array
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.set('view engine', 'ejs'); //to get view engine to work with ejs, place below express(); 
app.use(bodyParser.urlencoded({extended: true})); //this code is needed to get body-parser to work 

app.get("/", function (req, res) {
    
    const day = date.getDate(); //calls the local module

    if (defaultItems.length === 0){
        Item.insertMany(defaultItems, function(err){
            if (err){
                console.log(err);
            } else {
                console.log("Successful");
            }
        });
        //insert the defaultItems to Item collections 
        res.redirect("/"); 
    } else {
        Item.find({}, function(err, toDoItems){
            res.render("list", {
                listTitle: day,
                newListItems:  toDoItems
            });  
    })
    }
});
    //render a file named list.ejs from a folder named views
    //Rendering Database Item


app.post("/", function(req, res){
    
    const itemName = req.body.newItem; //access the input in newItem
    
    const item = new Item({
        name: itemName
    });

    item.save();

    res.redirect("/");
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;

    Item.deleteOne({_id: checkedItemId}, function(err){
        if (err){
            console.log(err);
        } else {
            res.redirect("/");
        }

    })
})

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    const list = new List({
        name: customListName,
        items: defaultItems
    });

    list.save();
}); //Express route parameters

app.get("/about", function(req, res){
    res.render("about");
}); //to create a new page for about page

app.listen(3000, function () {
    console.log("server is running on port 3000");
});
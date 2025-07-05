const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


const MONGO_URL =
  "mongodb+srv://td3393409:uEogvMgNyL8rQq88@cluster0.rjqjtbg.mongodb.net/wanderlust?retryWrites=true&w=majority&appName=Cluster0";


main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "67297839c63c47637ce5637c",
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();
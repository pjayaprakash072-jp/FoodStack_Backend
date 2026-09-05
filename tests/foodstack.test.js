
const request =  require('supertest');
const app = require('../app');

let vendorId;
let token;
let outletId;
const vendorData = {
    name:"test Vendor",
    email:"test@gmail.com",
    password:"Test@123",
    phone:"1234567890",
    businessName:"test Restaurant",
    profileImg:"tests/Images/undraw_young-man-avatar_wgbd.png"
}
describe('Vendor API', () => {

    test("Create Vendor" , async()=>{
        const response = await request(app)
        .post("/vendor/create")
        .field("name",vendorData.name)
        .field("email",vendorData.email)
        .field("password",vendorData.password)
        .field("phone",vendorData.phone)
        .field("businessName",vendorData.businessName)
        .attach("profileImg",vendorData.profileImg);

        expect(response.statusCode).toBe(201);

        vendorId = response.body.vendor._id;

        await console.log(vendorId);

    },15000)



    // login test
    test("Vendor Login", async()=>{
        const response = await request(app)
        .post("/vendor/login")
        .send(
            {
                email:vendorData.email,
                password:vendorData.password
            }
        )

        expect(response.statusCode).toBe(200);

        token = response.body.token;

        vendorId = response.body.vendor._id;

        console.log(token);

    })




    // getting Vendor by id
    test("Get vendor by Id",async ()=>{
        const response = await request(app)
        .get(`/vendor/get/${vendorId}`)

        expect(response.statusCode).toBe(200)

        console.log(response.body.vendor)

    })



    test("getting all vendors" ,async ()=>{
        const response = await request(app)
        .get("/vendor/getall")

        expect(response.statusCode).toBe(200)

        console.log(response.body.vendors)

    })
    



    // updating vendor
    test("Updating vendor",async ()=>{
        const response = await request(app)
        .put("/vendor/update")
        .set("token",token)
        .field("name","tester")

        expect(response.statusCode).toBe(200);

        console.log(response.body.vendor)



    })
});

const outletData = {
    name: "FoodStack Outlet",
    description: "A simple test restaurant outlet",
    phone: "9876543210",
    address: "123 Main Street",
    city: "Chennai",
    area: "T Nagar",
    cuisine: ["Indian", "Chinese"],
    foodType: "both",
    openingTime: "09:00",
    closingTime: "22:00",
    image:"tests/Images/fruit shop-cuate.png"
};
describe("Outlet API",()=>{
    
    beforeAll(async()=>{
        const loginresponse = await request(app)
        .post("/vendor/login")
        .send(
            {
                "email":vendorData.email,
                "password":vendorData.password
            }
        )
        expect(loginresponse.statusCode).toBe(200);
        vendorId = loginresponse.body.vendor._id;
        token = loginresponse.body.token;
    })

    // creating outlet.
    test("Creating Outlet",async()=>{
        const response = await request(app)
        .post("/outlet/create")
        .set("token",token)
        .field("name",outletData.name)
        .field("description",outletData.description)
        .field("phone",outletData.phone)
        .field("address",outletData.address)
        .field("city",outletData.city)
        .field("area",outletData.area)
        .field("cuisine",outletData.cuisine)
        .field("foodType",outletData.foodType)
        .field("openingTime",outletData.openingTime)
        .field("closingTime",outletData.closingTime)
        .attach("image",outletData.image)

        expect(response.statusCode).toBe(201)

        outletId = response.body.outlet._id;

        console.log(response.body.outlet)

    },15000)


    test("Getting Outlet by Id",async()=>{
        const response = await request(app)
        .get(`/outlet/get/${outletId}`)
        expect(response.statusCode).toBe(200);

    })
    test("Getting all outlets",async()=>{
        const response = await request(app)
        .get("/outlet/getall")
        expect(response.statusCode).toBe(200);

    })
    test("gettign outlets by vendor",async()=>{
        const response = await request(app)
        .get(`/outlet/vendor/${vendorId}`)
        expect(response.statusCode).toBe(200);

    })
    test("Updating Outlet",async()=>{
        const response = await request(app)
        .put(`/outlet/update/${outletId}`)
        .set("token",token)
        .field("name","Updated FoodStack Outlet")
        expect(response.statusCode).toBe(200);

    })
    test("Deleting outlet",async()=>{
        const response = await request(app)
        .delete(`/outlet/delete/${outletId}`)
        .set("token",token)
        expect(response.statusCode).toBe(200);
    })
    test("Deleting vendor",async()=>{
        const response = await request(app)
        .delete(`/vendor/delete/${vendorId}`)
        .set("token",token)
        expect(response.statusCode).toBe(200);
    
    })
})




// Jest
//  ↓
// dotenv loaded (12 variables)
//  ↓
// MongoDB connected ✅
//  ↓
// Redis connected ✅
//  ↓
// GET /menu-item/getall
//  ↓
// Redis CACHE MISS
//  ↓
// MongoDB fetch
//  ↓
// HTTP 200
//  ↓
// Jest test PASSED ✅
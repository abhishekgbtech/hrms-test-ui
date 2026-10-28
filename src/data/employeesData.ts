export interface EmployeeData {
  full_name: string;
  email: string;
  employee_id: string;
  designation: string;
  primary_role: 'employee' | 'manager' | 'hr' | 'business_head' | 'admin';
  access_level: number;
  status: 'active' | 'inactive' | 'on_leave';
  password: string;
}

export const employeesData: EmployeeData[] = [
  {
    full_name: "Deepa Rathi",
    email: "deepa.rathi@ecovis.com",
    employee_id: "EMP001",
    designation: "Business Head",
    primary_role: "business_head",
    access_level: 4,
    status: "active",
    password: "911"
  },
  {
    full_name: "Namita Chaudhary",
    email: "namita.chaudhary@ecovis.com",
    employee_id: "EMP002",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Namdev Malusare",
    email: "namdev.malusare@ecovis.com",
    employee_id: "EMP003",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sudhir Bhosale",
    email: "sudhir.bhosale@ecovis.com",
    employee_id: "EMP004",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Mukesh Singh",
    email: "mukesh.singh@ecovis.com",
    employee_id: "EMP005",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Arti Malusare",
    email: "arti.malusare@ecovis.com",
    employee_id: "EMP006",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Prasidh Sapaliga",
    email: "prasidh.sapaliga@ecovis.com",
    employee_id: "EMP007",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Dheeraj Rathi",
    email: "dheeraj.rathi@ecovis.com",
    employee_id: "EMP008",
    designation: "Business Head",
    primary_role: "business_head",
    access_level: 4,
    status: "active",
    password: "911"
  },
  {
    full_name: "Bharat Mishra",
    email: "bharat.mishra@ecovis.com",
    employee_id: "EMP009",
    designation: "Director",
    primary_role: "manager",
    access_level: 2,
    status: "active",
    password: "911"
  },
  {
    full_name: "Dheeraj Rathi RKCA",
    email: "dheeraj.rathi.rkca@ecovis.com",
    employee_id: "EMP010",
    designation: "Business Head",
    primary_role: "business_head",
    access_level: 4,
    status: "active",
    password: "911"
  },
  {
    full_name: "Pooja Disale",
    email: "pooja.disale@ecovis.com",
    employee_id: "EMP011",
    designation: "Team Lead",
    primary_role: "manager",
    access_level: 2,
    status: "active",
    password: "911"
  },
  {
    full_name: "Vidhi Shah",
    email: "vidhi.shah@ecovis.com",
    employee_id: "EMP012",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Suraj Rajbhar",
    email: "suraj.rajbhar@ecovis.com",
    employee_id: "EMP013",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Snehal Misal",
    email: "snehal.misal@ecovis.com",
    employee_id: "EMP014",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Aryan Singh",
    email: "aryan.singh@ecovis.com",
    employee_id: "EMP015",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Shweta Chaudhari",
    email: "shweta.chaudhari@ecovis.com",
    employee_id: "EMP016",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Dharmesh Singh",
    email: "dharmesh.singh@ecovis.com",
    employee_id: "EMP017",
    designation: "Ex Employee",
    primary_role: "employee",
    access_level: 1,
    status: "inactive",
    password: "911"
  },
  {
    full_name: "Minal Kasavkar",
    email: "minal.kasavkar@ecovis.com",
    employee_id: "EMP018",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Priti Sutar",
    email: "priti.sutar@ecovis.com",
    employee_id: "EMP019",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Tanmay Vilas Nipane",
    email: "tanmay.nipane@ecovis.com",
    employee_id: "EMP020",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sanjana Konda",
    email: "sanjana.konda@ecovis.com",
    employee_id: "EMP021",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Poonam Priyadarshini",
    email: "poonam.priyadarshini@ecovis.com",
    employee_id: "EMP022",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Muthupriya Maruthappan",
    email: "muthupriya.maruthappan@ecovis.com",
    employee_id: "EMP023",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Abhishek Kadam",
    email: "abhishek.kadam@ecovis.com",
    employee_id: "EMP024",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sandip Salunkhe",
    email: "sandip.salunkhe@ecovis.com",
    employee_id: "EMP025",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Niket Birje",
    email: "niket.birje@ecovis.com",
    employee_id: "EMP026",
    designation: "Ex Employee",
    primary_role: "employee",
    access_level: 1,
    status: "inactive",
    password: "911"
  },
  {
    full_name: "Yogesh Birla",
    email: "yogesh.birla@ecovis.com",
    employee_id: "EMP027",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Shweta Sanjay Valvi",
    email: "shweta.valvi@ecovis.com",
    employee_id: "EMP028",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Preeti Shivling Vhatkar",
    email: "preeti.vhatkar@ecovis.com",
    employee_id: "EMP029",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Umang",
    email: "umang@ecovis.com",
    employee_id: "EMP030",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Saloni Jain",
    email: "saloni.jain@ecovis.com",
    employee_id: "EMP031",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sahil Singh",
    email: "sahil.singh@ecovis.com",
    employee_id: "EMP032",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Swati Modani",
    email: "swati.modani@ecovis.com",
    employee_id: "EMP033",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Satyaprakash Sanjay Tiwari",
    email: "satyaprakash.tiwari@ecovis.com",
    employee_id: "EMP034",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Manisha Shetye",
    email: "manisha.shetye@ecovis.com",
    employee_id: "EMP035",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Salvi Kumari",
    email: "salvi.kumari@ecovis.com",
    employee_id: "EMP036",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Aymaan Mulla",
    email: "aymaan.mulla@ecovis.com",
    employee_id: "EMP037",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Ayush Rathi",
    email: "ayush.rathi@ecovis.com",
    employee_id: "EMP038",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Ayushi Sharma",
    email: "ayushi.sharma@ecovis.com",
    employee_id: "EMP039",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Jason Coelho",
    email: "jason.coelho@ecovis.com",
    employee_id: "EMP040",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Urvi Bhimjiani",
    email: "urvi.bhimjiani@ecovis.com",
    employee_id: "EMP041",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Kimaya Koranne",
    email: "kimaya.koranne@ecovis.com",
    employee_id: "EMP042",
    designation: "HR",
    primary_role: "hr",
    access_level: 3,
    status: "active",
    password: "911"
  },
  {
    full_name: "Pooja Bang",
    email: "pooja.bang@ecovis.com",
    employee_id: "EMP043",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Shwetali Mane",
    email: "shwetali.mane@ecovis.com",
    employee_id: "EMP044",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Ajay Chauhan",
    email: "ajay.chauhan@ecovis.com",
    employee_id: "EMP045",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Rinky Dwivedi",
    email: "rinky.dwivedi@ecovis.com",
    employee_id: "EMP046",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sweksha S Bhagat",
    email: "sweksha.bhagat@ecovis.com",
    employee_id: "EMP047",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Janvi Pise",
    email: "janvi.pise@ecovis.com",
    employee_id: "EMP048",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Yash Panchal",
    email: "yash.panchal@ecovis.com",
    employee_id: "EMP049",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Archana Pawar",
    email: "archana.pawar@ecovis.com",
    employee_id: "EMP050",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sakshi Gupta",
    email: "sakshi.gupta@ecovis.com",
    employee_id: "EMP051",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Siddhesh Malusare",
    email: "siddhesh.malusare@ecovis.com",
    employee_id: "EMP052",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sambid Kumar Pradhan",
    email: "sambid.pradhan@ecovis.com",
    employee_id: "EMP053",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Parthvi Gupta",
    email: "parthvi.gupta@ecovis.com",
    employee_id: "EMP054",
    designation: "Program Manager",
    primary_role: "manager",
    access_level: 2,
    status: "active",
    password: "911"
  },
  {
    full_name: "Pratiksha",
    email: "pratiksha@ecovis.com",
    employee_id: "EMP055",
    designation: "Testing",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sanjivani Dudwadkar",
    email: "sanjivani.dudwadkar@ecovis.com",
    employee_id: "EMP056",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Shiana Gumber",
    email: "shiana.gumber@ecovis.com",
    employee_id: "EMP057",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sahab Azhar",
    email: "sahab.azhar@ecovis.com",
    employee_id: "EMP058",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Radhika Kabra",
    email: "radhika.kabra@ecovis.com",
    employee_id: "EMP059",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Chandan Roshan",
    email: "chandan.roshan@ecovis.com",
    employee_id: "EMP060",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Supriya Gupta",
    email: "supriya.gupta@ecovis.com",
    employee_id: "EMP061",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Test User",
    email: "test@ecovis.com",
    employee_id: "EMP062",
    designation: "Test",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Tisha Rathi",
    email: "tisha.rathi@ecovis.com",
    employee_id: "EMP063",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Disha Chheda",
    email: "disha.chheda@ecovis.com",
    employee_id: "EMP064",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Rohan Misquitta",
    email: "rohan.misquitta@ecovis.com",
    employee_id: "EMP065",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Afrah Shaikh",
    email: "afrah.shaikh@ecovis.com",
    employee_id: "EMP066",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Prashant Gupta",
    email: "prashant.gupta@ecovis.com",
    employee_id: "EMP067",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Lavish Soni",
    email: "lavish.soni@ecovis.com",
    employee_id: "EMP068",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Lavanya Ingawale",
    email: "lavanya.ingawale@ecovis.com",
    employee_id: "EMP069",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "S Krishnanagri",
    email: "s.krishnanagri@ecovis.com",
    employee_id: "EMP070",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Ankit Lekhra",
    email: "ankit.lekhra@ecovis.com",
    employee_id: "EMP071",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Paridhi Vijayvargiya",
    email: "paridhi.vijayvargiya@ecovis.com",
    employee_id: "EMP072",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Anjali Gupta",
    email: "anjali.gupta@ecovis.com",
    employee_id: "EMP073",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Daryl Raj",
    email: "daryl.raj@ecovis.com",
    employee_id: "EMP074",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Pornima Bhingarde",
    email: "pornima.bhingarde@ecovis.com",
    employee_id: "EMP075",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Yash Khona",
    email: "yash.khona@ecovis.com",
    employee_id: "EMP076",
    designation: "AI Specialist",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Akshata Kawade",
    email: "akshata.kawade@ecovis.com",
    employee_id: "EMP077",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Gulshan Kumar",
    email: "gulshan.kumar@ecovis.com",
    employee_id: "EMP078",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Pravin Gupta",
    email: "pravin.gupta@ecovis.com",
    employee_id: "EMP079",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Akshat Mutha",
    email: "akshat.mutha@ecovis.com",
    employee_id: "EMP080",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Siddhi Walzade",
    email: "siddhi.walzade@ecovis.com",
    employee_id: "EMP081",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Lata Shetty",
    email: "lata.shetty@ecovis.com",
    employee_id: "EMP082",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Kunal Kumar",
    email: "kunal.kumar@ecovis.com",
    employee_id: "EMP083",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sindhu Rajan",
    email: "sindhu.rajan@ecovis.com",
    employee_id: "EMP084",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Nazreen Siddiqui",
    email: "nazreen.siddiqui@ecovis.com",
    employee_id: "EMP085",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Sakshi Mantri",
    email: "sakshi.mantri@ecovis.com",
    employee_id: "EMP086",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Prachi Kulkarni",
    email: "prachi.kulkarni@ecovis.com",
    employee_id: "EMP087",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  },
  {
    full_name: "Shivam Taparia",
    email: "shivam.taparia@ecovis.com",
    employee_id: "EMP088",
    designation: "Employee",
    primary_role: "employee",
    access_level: 1,
    status: "active",
    password: "911"
  }
];

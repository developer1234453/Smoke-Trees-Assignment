const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');


const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



app.use(bodyParser.json());

//create db
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 3000, 
});


//define table like user and address
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});


const Address = sequelize.define('Address', {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
});
// here i mentioned the Establish relationships between the tables or collections that is one-to-many

User.hasMany(Address, { foreignKey:'userId'});
Address.belongsTo(User, { foreignKey:'userId'});

// create user 
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, address } = req.body;

   
    const newUser = await User.create({ name });

   
    await Address.create({
      address,
      userId: newUser.id,
    });

    res.status(201).json({ message: 'User and address saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'an error occurred while saving data' });
  }
});

// recover the data that are stored
app.get('/api/users', async (reqest, response) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Address,
      }],
    });
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ error: 'an error occurred while fetching user' });
  }
});

// responce of get methode
app.get('/', (request, response) => {
  response.send('Server is running');
});

// for synchronizing your Sequelize models and also to known either it's working or not to under stand for developers
sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect database:', err);
  });



  

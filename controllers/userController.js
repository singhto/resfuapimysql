const bcryptjs = require('bcryptjs');
const models = require('../models/index');

exports.index = async (req, res, next) => {

  //const users = await models.User.findAll();

  // const users = await models.User.findAll({
  //   attributes: ['id','name','email','created_at'],
  //   order: [['id','desc']]
  // });

  // const users = await models.User.findAll({
  //   attributes: { exclude: ['password'] },
  //   order: [['id','desc']]
  // });

  // const users = await models.User.findAll({
  //   attributes: ['id','name','email','created_at'],
  //   where: {
  //     email: 'kantima@gmail.com'
  //   },
  //   order: [['id','desc']]
  // });

  const users = await models.User.findAll({
    attributes: { exclude: ['password'] },
    include: [
      {
        model: models.Blog,
        as: 'blogs',
        attributes: ['id' , 'title', 'user_id']
      }
    ],
    order: [['id', 'desc'],['blogs', 'id', 'desc']]
  });




  res.status(200).json({
    data: users
  });
}

//show แสดงข้อมูล
exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      const error = new Error('ไม่พบผู้ใช้ในระบบ');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      data: user
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }
}

// insert
exports.insert = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //check email ซ้ำ
    const existEmail = await models.User.findOne({ where: { email: email } });

    if (existEmail) {
      const error = new Error('มีผู้ใช้อีเมลนี้แล้ว กรุณาใช้อีเมลใหม่');
      error.statusCode = 400;
      throw error;
    }

    //hash password
    const salt = await bcryptjs.genSalt(8);
    const passwordHash = await bcryptjs.hash(password, salt);

    //insert user
    const user = await models.User.create({
      name: name,
      email: email,
      password: passwordHash
    })

    return res.status(201).json({
      message: 'เพิ่มข้อมูลเรียบร้อย',
      data: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }
}

// update แก้ไขข้อมํล
exports.update = async (req, res, next) => {
  try {
    const { id, name, email, password } = req.body;

    if (req.params.id !== id) {
      const error = new Error('รหัสผู้ใช้ไม่ถูกต้อง');
      error.statusCode = 400;
      throw error;
    }

    //hash password
    const salt = await bcryptjs.genSalt(8);
    const passwordHash = await bcryptjs.hash(password, salt);


    //update user
    const user = await models.User.update({
      name: name,
      email: email,
      password: passwordHash
    },{
      where: {
        id: id
      }
    });

    return res.status(200).json({
      message: 'แก้ไขข้อมูลเรียบร้อย',
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }
}

// destroy
exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(id);

    if (!user) {
      const error = new Error('ไม่พบผู้ใช้ในระบบ');
      error.statusCode = 404;
      throw error;
    }

    //delete user bu id
    await models.User.destroy({
      where: {
        id : id
      }
    });

    return res.status(200).json({
      message: 'ลบข้อมูลเรียบร้อย',
    });
  } catch (error) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message
      }
    });
  }
}

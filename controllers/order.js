const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');

//localhost:5000/api/order/get?offset=2&limit=5
module.exports.getAll = async function(req, res) {
  const query = {
    user: req.user.id
  };

  if (req.query.start) {
    query.date = {
      $gte: req.query.start
    };
  }
  if (req.query.end) {
    if (!query.date) {
      query.date = {};
    }
    query.date['lte'] = req.query.end;
  }

  if (req.query.order) {
    query.order = +re.query.order;
  }
  try {
    const orders = await Order.find(query)
      .sort({ date: -1 })
      .skip(+req.query.offset)
      .limit(+req.query.limit);
    res.status(200).json(orders);
  } catch (e) {
    errorHandler(res, e);
  }
};

module.exports.create = async function(req, res) {
  if (req.body.list) {
    try {
      const lastOrder = await Order.findOne({ user: req.user.id }).sort({ date: -1 });
      const maxOrder = lastOrder ? lastOrder.order : 0;
      const order = new Order({
        list: req.body.list,
        user: req.user.id,
        order: maxOrder + 1
      });
      await order.save();
      res.status(201).json(order);
    } catch (e) {
      errorHandler(res, e);
    }
  } else {
    res.status(400).json({
      message: 'Bad request, no name or cost or category.'
    });
  }
};

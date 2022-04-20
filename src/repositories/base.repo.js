const { Sequelize } = require('sequelize');

class BaseModel {
  constructor(model) {
      this.model = model
  }

  getModel = () => {
      return this.model
  }

  _validateArguments = (obj) => {
        for (const key in obj) {
            if (obj[key] === undefined) {
                delete obj[key];
            }
        }

        return obj
  }

  create = async(object, opts = {}) => {
      try {
          const data = await this.model.create(object, opts)
          return data
      } catch (error) {
          console.log(error.message)
          throw new Error(error)
      }
  }

  bulkCreate = async (objects, opts = {}) => {
      try {
          const data = await this.model.bulkCreate(objects, opts)
          return data
      } catch (error) {
          console.log(error.message)
          throw new Error(error)
      }
  }

  findOne = async({where, limit, order, offset, raw, attributes}) => {
      try {
          const data = await this.model.findOne(this._validateArguments({where, limit, order, offset, raw, attributes}))
          return data
      } catch (error) {
          console.log(error.message)
          throw new Error(error)
      }
  }

  find = async({where, limit, order, offset, raw, attributes}) => {
        try {
            const data = await this.model.findAll(this._validateArguments({where, limit, order, offset, raw, attributes}))
            return data
        } catch (error) {
            console.log(error.message)
            throw new Error(error)
        }
    }


  aggregate = async({where, order, raw, attributes, col, group}) => {
        try {
            attributes = [...attributes, [Sequelize.fn('sum', Sequelize.col(col)), col]]
            
            const data = this.model.findAll(this._validateArguments({
                where,
                attributes,
                group,
                raw,
                order
              }));

            return data
        } catch (error) {
            console.log(error.message)
            throw new Error(error)
        }
    }

    update = async({where, object}) => {
        try {
            const data = await this.model.update(object, {where})
            return data
        } catch (error) {
            console.log(error.message)
            throw new Error(error)
        }
    }

  count = async({where}) => {
      try {
          const data = await this.model.count({where})
          return data
      } catch (error) {
          console.log(error.message)
          throw new Error(error)
      }
  }

  truncate = async() => {
    try {
        await this.model.destroy({ truncate: true });
    } catch (error) {
        console.log(error.message)
        throw new Error(error)
    }
  }
}

module.exports = BaseModel

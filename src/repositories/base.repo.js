class BaseModel {
  constructor(model) {
      this.model = model
  }

  getModel = () => {
      return this.model
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

  findOne = async({where, limit, order, offset, raw}) => {
      try {
          const data = await this.model.findOne({where, limit, order, offset, raw})
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

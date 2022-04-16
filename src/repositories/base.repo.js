class BaseModel {
  constructor(model) {
      this.model = model
  }

  getModel = () => {
      return this.model
  }

  async create(body, opts = {}) {
      try {
          const data = await this.model.create(body, opts)
          return data
      } catch (error) {
          // console.log(error)
          throw new Error(error)
      }
  }


  async bulkCreate(d, opts = {}) {
    try {
        const data = await this.model.bulkCreate(d, opts)
        return data
    } catch (error) {
        // console.log(error)
        throw new Error(error)
    }
}
}

module.exports = BaseModel

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info)

    return item
  },
  async updateItem(parent, args, ctx, info) {
    const updates = { ...args } // copy updates
    delete updates.id

    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      },
      info
    })
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // find item
    const item = await ctx.db.query.item({ where }, `{
      id
      title
    }`)
    // check permissions TODO
    // delete
    return ctx.db.mutation.deleteItem({ where }, info)
  }
};

module.exports = Mutations;

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const randomBytes = promisify(require('crypto').randomBytes)
const { transport, toHTMLEmail } = require('../mail')
const { hasPermission } = require('../utils')

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that')
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        user: { // create many to one relation
          connect: {
            id: ctx.request.userId
          }
        },
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
      user {
        id
      }
    }`)
    // check permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission))
    if (!(ownsItem || hasPermissions)) throw new Error('You do not have the required permissions')

    // delete
    return ctx.db.mutation.deleteItem({ where }, info)
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    // hash pw
    const password = await bcrypt.hash(args.password, 12)
    // create db entity
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      }
    }, info)

    // create JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // we set the cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if user exists
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No user found for email ${email}`)
    }

    // validate password
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password')
    }

    // generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)

    // set cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Good riddance' }
  },
  async requestReset(parent, args, ctx, info) {
    // check if user exists
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) {
      throw new Error(`No user found for email ${args.email}`)
    }

    // set reset token & expiry
    const resetToken = (await randomBytes(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 1000 * 60 * 60
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })
    // email token
    const mail = await transport.sendMail({
      from: 'support@sick-fits.com',
      to: user.email,
      subject: 'Password Reset',
      html: toHTMLEmail(`Your password reset token is\n
      \n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
        Click here to reset
      </a>`)
    })
    return { message: 'Good riddance' }
  },
  async resetPassword(parent, args, ctx, info) {
    // check if passwords match
    if (!args.password || args.password !== args.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    // check if token is legit & not expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 1000 * 60 * 60,
      }
    })
    if (!user) {
      throw new Error('Reset token is either invalid or expired')
    }
    // hash new password & persist
    const password = await bcrypt.hash(args.password, 12)
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      },
    })

    // generate JWT token
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)

    // set cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    return updatedUser
  },
  async updatePermissions(parent, args, ctx, info) {
    // check permissions
    if (!ctx.request.userId) {
      throw new Error('You must be logged in')
    }
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    )

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])

    // update permissions
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: args.permissions
        }
      },
      where: {
        id: args.userId
      }
    }, info)
  }
};

module.exports = Mutations;

Bmob.initialize("b0359ad4154cac5660ec396c7411f389", "588a4ae2748d661c915f14c4dff4ac10")

// 注册
export function register(userInfo = {}) {
  return new Promise(function (resolve, reject) {
    var user = new Bmob.User()
    user.set("username", userInfo.username)
    user.set("password", userInfo.password)
    user.set("email", userInfo.email)
    user.signUp(null, {
      success: function (user) {
        resolve(user)
      },
      error: function (user, error) {
        reject(error)
      }
    });
  })
}

// 登录
export function login(userInfo = {}) {
  return new Promise(function (resolve, reject) {
    Bmob.User.logIn(userInfo.username, userInfo.password, {
      success: function (user) {
        if (!user.get('emailVerified')) {
          resolve({ 'code': '001', 'email': user.get('email') })
          return
        }
        resolve({ 'code': '000', 'avatar': user.get('avatar'), 'userId': user.id })
      },
      error: function (user, error) {
        reject(error)
      }
    });
  })
}

// 登出
export function bmobLogout() {
  return new Promise(function (resolve, reject) {
    try {
      Bmob.User.logOut()
      resolve({ 'code': '000', 'message': '登出成功' })
    } catch (error) {
      reject({ 'code': '001', 'message': '登出失败' })
    }
  })
}

// 重置查询密码
export function resetPwd(payload) {
  return new Promise(function(resolve, reject) {
    Bmob.User.requestPasswordReset(payload, {
      success: function () {
        resolve({ 'code': '000', 'message': '发送成功' })
      },
      error: function (error) {
        reject({ 'code': '001', 'message': '重置错误'})
      }
    });
  })
}

// 判断是否登录，获取当前登录的用户
export function currentUser() {
  return new Promise(function (resolve, reject) {
    var currentUser = Bmob.User.current()
    if (currentUser) {
      resolve(currentUser)
    } else {
      reject({ 'code': '001', 'message': '未登录' })
    }
  })
}


// 查找文章列表，可以带参数
export function queryArticleList(config = {}) {
  return new Promise(function (resolve, reject) {
    var table = Bmob.Object.extend('article_list')
    var query = new Bmob.Query(table)
    if (config.columnId) {
      query.equalTo("columnId", config.columnId)
    } else if (config.userId) {
      query.equalTo("userId", config.userId)
    } else {
      query.equalTo("userId", '08dac1c847')
    }
    // 查询所有数据
    query.find({
      success: function (result) {
        let articleList = []
        for (let i = 0; i < result.length; i++) {
          let object = result[i].attributes
          object.tags = object.tags.split('，')
          object.ID = result[i].id
          object.date = result[i].createdAt
          object.updateDate = result[i].updatedAt
          articleList.push(object)
        }
        resolve(articleList.reverse())
      },
      error: function (error) {
        reject('文章加载失败')
      }
    })
  })
}

// 查找文章，带文章ID，带用户头像
export function queryOneArticle(articleId) {
  return new Promise(function (resolve, reject) {
    var table = Bmob.Object.extend('article_list')
    var query = new Bmob.Query(table)
    query.get(articleId, {
      success: function (result) {
        let object = result.attributes
        object.tags = object.tags.split('，')
        object.ID = result.id
        object.date = result.updatedAt
        resolve(object)
      },
      error: function (error) {
        reject('文章加载失败')
      }
    })
  })
}

// 查找草稿箱列表，可以带参数
export function queryDrafteList(config = {}) {
  return new Promise(function (resolve, reject) {
    var draft = Bmob.Object.extend('article_draft')
    var query = new Bmob.Query(draft)
    if (config.columnId) {
      query.equalTo("columnId", config.columnId)
    } else if (config.userId) {
      query.equalTo("userId", config.userId)
    }
    // 查询所有数据
    query.find({
      success: function (result) {
        let articleList = []
        for (let i = 0; i < result.length; i++) {
          let object = result[i].attributes
          object.tags = object.tags.split('，')
          object.ID = result[i].id
          object.date = result[i].updatedAt
          articleList.push(object)
        }
        resolve(articleList.reverse())
      },
      error: function (error) {
        reject('草稿箱加载失败')
      }
    })
  })
}

// 查找草稿箱，带文章ID
export function queryOneDraft(draftId) {
  return new Promise(function (resolve, reject) {
    var table = Bmob.Object.extend('article_draft')
    var query = new Bmob.Query(table)
    query.get(draftId, {
      success: function (result) {
        let object = result.attributes
        object.tags = object.tags.split('，')
        object.ID = result.id
        object.date = result.updatedAt
        resolve(object)
      },
      error: function (error) {
        reject('草稿加载失败')
      }
    })
  })
}

// 上传文章
export function pushArticle(articleObj) {
  return new Promise(function (resolve, reject) {
    // 通过objectId判断是新文章还是更新文章
    if (!articleObj.objectId) {
      //创建类和实例
      var Article = Bmob.Object.extend('article_list')
      var article = new Article()
      article.save(articleObj, {
        success: function (articleObj) {
          // 添加成功
          resolve(articleObj)
        },
        error: function (articleObj, error) {
          // 添加失败
          reject('添加文章失败')
        }
      })
    } else {
      var Article = Bmob.Object.extend("article_list")
      var query = new Bmob.Query(Article)
      // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
      query.get(articleObj.objectId, {
        success: function (article) {
          article.set('userId', articleObj.userId)
          article.set('col', articleObj.col)
          article.set('columnId', articleObj.columnId)
          article.set('content', articleObj.content)
          article.set('intro', articleObj.intro)
          article.set('mainTitle', articleObj.mainTitle)
          article.set('original', articleObj.original)
          article.set('render', articleObj.render)
          article.set('tags', articleObj.tags)
          return article.save()
        },
        error: function (object, error) {
          reject('文章更新失败')
        }
      }).then(() => {
        resolve('文章更新成功')
      })
    }
  })
}

// 上传草稿箱
export function pushDraft(articleObj) {
  return new Promise(function (resolve, reject) {
    //创建类和实例
    if (!articleObj.objectId) {
      var Draft = Bmob.Object.extend('article_draft')
      var draft = new Draft()
      draft.save(articleObj, {
        success: function (articleObj) {
          resolve(articleObj)
        },
        error: function (articleObj, error) {
          reject('添加草稿箱失败')
        }
      })
    } else {
      var Article = Bmob.Object.extend("article_draft")
      var query = new Bmob.Query(Article)
      // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
      query.get(articleObj.objectId, {
        success: function (article) {
          article.set('userId', articleObj.userId)
          article.set('col', articleObj.col)
          article.set('columnId', articleObj.columnId)
          article.set('content', articleObj.content)
          article.set('intro', articleObj.intro)
          article.set('mainTitle', articleObj.mainTitle)
          article.set('original', articleObj.original)
          article.set('render', articleObj.render)
          article.set('tags', articleObj.tags)
          return article.save()
        },
        error: function (object, error) {
          reject('草稿更新失败')
        }
      }).then(() => {
        resolve('草稿更新成功')
      })
    }
  })
}

// 清除文章
export function deatroyArticle(articleId) {
  return new Promise(function (resolve, reject) {
    var table = Bmob.Object.extend('article_list')
    var query = new Bmob.Query(table)
    query.get(articleId, {
      success: function (result) {
        result.destroy({
          success: function (myObject) {
            resolve('删除文章成功')
          },
          error: function (myObject, error) {
            reject('删除文章失败')
          }
        });
      },
      error: function (error) {
        reject('草稿加载失败')
      }
    })
  })
}

// 清除草稿
export function deatroyDraft(draftId) {
  return new Promise(function (resolve, reject) {
    var table = Bmob.Object.extend('article_draft')
    var query = new Bmob.Query(table)
    query.get(draftId, {
      success: function (result) {
        result.destroy({
          success: function (myObject) {
            resolve('删除草稿成功')
          },
          error: function (myObject, error) {
            reject('删除草稿失败')
          }
        });
      },
      error: function (error) {
        reject('草稿加载失败')
      }
    })
  })
}


// 查找某一个用户
export function queryOneUser(userId = '08dac1c847') {
  return new Promise(function (resolve, reject) {
    var User = Bmob.Object.extend('_User')
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(User)
    query.select('avatar', 'showName', 'singName')
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get(userId, {
      success: function (result) {
        // 查询成功，调用get方法获取对应属性的值
        resolve(result.attributes)
      },
      error: function (object, error) {
        // 查询失败
        reject('用户查找失败')
      }
    });
  })
}

// 更新用户信息
export function updateUserInfo(userId, info) {
  return new Promise(function (resolve, reject) {
    var query = new Bmob.Query(Bmob.User)
    query.equalTo('objectId', userId)
    query.find({
      success: function (women) {
        for (const key in info) {
          women[0].set(key, info[key])
        }
        women[0].save()
        resolve(women[0].attributes)
      },
      error: function (res) {
        reject('用户信息修改失败')
      }
    })
  })
}

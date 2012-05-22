n = require('natives')
path = n.path
base= path.resolve('test')
Project = require(path.resolve("lib/projects/project"))
Config = require(path.resolve('lib/projects/config'))
p = new Project(base)
p.config
p.config.load
p.config.load()
p.config
p.config.project
p.config.project.base
p.config.load()
p.config.deps

/* global atom beforeEach waitsForPromise waitsFor runs describe it expect */
'use strict'

var PlantumlPreviewEditor = require('../lib/plantuml-preview-editor')

var TOGGLE = 'plantuml-preview:toggle'

describe('PlantumlPreview', function () {
  var activationPromise
  var workspaceElement

  beforeEach(function () {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('plantuml-preview')

    waitsForPromise(function () {
      return atom.packages.activatePackage('language-plantuml')
    })
  })

  function waitsForPreviewToBeCreated () {
    waitsFor(function () {
      return atom.workspace.getPanes()[1].getActiveItem()
    })
  }

  function waitsForActivation () {
    waitsForPromise(function () {
      return activationPromise
    })
  }

  function waitsForOpening (file) {
    waitsForPromise(function () {
      return atom.workspace.open(file)
    })
  }

  function runsToggle () {
    runs(function () {
      atom.commands.dispatch(workspaceElement, TOGGLE)
    })
  }

  describe('when the plantuml-preview:toggle event is triggered', function () {
    it('should create a second pane', function () {
      waitsForOpening('file.puml')

      runs(function () {
        expect(atom.workspace.getPanes()).toHaveLength(1)
      })

      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()

      runs(function () {
        expect(atom.workspace.getPanes()).toHaveLength(2)
      })
    })

    it('should not add a new editor to first pane', function () {
      var firstPane = atom.workspace.getPanes()[0]
      expect(firstPane.getItems()).toHaveLength(0)

      waitsForOpening('file.puml')

      runs(function () {
        expect(firstPane.getItems()).toHaveLength(1)
      })

      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()

      runs(function () {
        expect(firstPane.getItems()).toHaveLength(1)
      })
    })

    it('should keep first pane active', function () {
      var firstPane = atom.workspace.getPanes()[0]

      waitsForOpening('file.puml')

      runs(function () {
        expect(firstPane.isActive()).toBe(true)
      })

      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()

      runs(function () {
        expect(firstPane.isActive()).toBe(true)
      })
    })

    it('should create a pane with a PlantumlPreviewEditor', function () {
      waitsForOpening('file.puml')
      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()
      runs(function () {
        var preview = atom.workspace.getPanes()[1].getActiveItem()
        expect(preview).toBeInstanceOf(PlantumlPreviewEditor)
      })
    })

    it('should destroy active PlantumlPreviewEditor', function () {
      waitsForOpening('file.puml')
      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()
      runs(function () {
        var previewPane = atom.workspace.getPanes()[1]
        expect(previewPane.isActive()).toBe(false)

        previewPane.activate()
        expect(previewPane.isActive()).toBe(true)
        expect(previewPane.getItems()).toHaveLength(1)

        atom.commands.dispatch(workspaceElement, TOGGLE)
        expect(previewPane.getItems()).toHaveLength(0)
      })
    })

    it('should destroy editor on second toggle', function () {
      waitsForOpening('file.puml')
      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()
      runs(function () {
        var previewPane = atom.workspace.getPanes()[1]
        expect(previewPane.getItems()).toHaveLength(1)
        atom.commands.dispatch(workspaceElement, TOGGLE)
        expect(previewPane.getItems()).toHaveLength(0)
      })
    })

    it('should show preview pane for text.plain files', function () {
      waitsForPromise(function () {
        return atom.packages.activatePackage('language-text')
      })
      waitsForOpening('text-plain.txt')
      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()
      runs(function () {
        expect(atom.workspace.getPanes()).toHaveLength(2)
      })
    })

    it('should show preview pane for text.plain.null-grammar files', function () {
      waitsForOpening('null-grammar')
      runsToggle()
      waitsForActivation()
      waitsForPreviewToBeCreated()
      runs(function () {
        expect(atom.workspace.getPanes()).toHaveLength(2)
      })
    })

  })
})

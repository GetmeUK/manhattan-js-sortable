# Imports

chai = require 'chai'
jsdom = require 'mocha-jsdom'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

$ = require 'manhattan-essentials'
Sortable = require('../src/scripts/sortable').Sortable


# Set up

should = chai.should()
chai.use(sinonChai)


# Tests

# A list of languages
languages = [
    'CoffeeScript',
    'Java',
    'JavaScript',
    'Lua',
    'MoonScript',
    'Perl',
    'PHP',
    'Python',
    'Ruby'
    ]


describe 'Sortable (class)', ->

    jsdom()

    list = null
    listItems = null
    sortable = null

    beforeEach ->
        # Build a list to sort
        list = $.create('ul', {'data-mh-sortable': true})
        listItems = []
        for language in languages
            listItem = $.create('ul', {})
            listItem.innerText = language
            listItems.push(listItem)
            list.appendChild(listItem)

        document.body.appendChild(list)

        # Make the list sortable
        sortable = new Sortable(list)

    afterEach ->
        sortable.destroy()
        document.body.removeChild(list)

    describe 'constructor', ->

        it 'should generate a new `Sortable` instance', ->

            sortable.should.be.an.instanceof Sortable

        it 'should add the `mh-sortable` class to the list', ->

            list.classList.contains('mh-sortable').should.be.true

    describe 'destroy', ->

        beforeEach ->
            sortable.destroy()

        it 'should remove the `mh-sortable` class to the list', ->

            list.classList.contains('mh-sortable').should.be.false

        it 'should sortable instance reference from the list', ->

            (list.__mh_sortable == undefined).should.be.true


describe 'Sortable (options)', ->

    jsdom()

    list = null
    listItems = null
    sortable = null

    beforeEach ->
        # Build a list to sort
        list = $.create('ul', {'data-mh-sortable': true})
        listItems = []
        for language in languages
            listItem = $.create('ul', {})
            listItem.innerText = language
            listItems.push(listItem)
            list.appendChild(listItem)

        document.body.appendChild(list)

        # Make the list sortable
        sortable = new Sortable(list)

    afterEach ->
        sortable.destroy()
        document.body.removeChild(list)

    describe 'axis', ->

        li = null

        beforeEach ->
            li = listItems[0]
            li.getBoundingClientRect = ->
                return {
                    bottom: 20,
                    height: 20,
                    left: 0,
                    right: 100,
                    top: 0,
                    width: 100
                    }

        describe 'when vertical', ->

            it 'should return true if the y position is less than half the
                height of the sibling', ->

                sortable.axis = 'vertical'

                # Before
                before = Sortable.behaviours.before.axis(sortable, li, [0, 5])
                before.should.be.true

                # After
                before = Sortable.behaviours.before.axis(sortable, li, [0, 15])
                before.should.be.false

        describe 'when horizontal', ->

            it 'should return true if the x position is less than half the
                width of the sibling', ->

                sortable.axis = 'horizontal'

                # Before
                before = Sortable.behaviours.before.axis(sortable, li, [10, 0])
                before.should.be.true

                # After
                before = Sortable.behaviours.before.axis(sortable, li, [55, 0])
                before.should.be.false

    describe 'childSelector', ->

        describe 'when even items only', ->

            # @@

    describe 'grabSelector', ->

        describe 'when .grab', ->

            # @@


describe 'Sortable (behaviors)', ->

    describe 'before', ->

        describe 'auto', ->

            # @@

        describe 'axis', ->

            # @@

    describe 'children', ->

        describe 'children', ->

            # @@

        describe 'selector', ->

            # @@

    describe 'grabber', ->

        describe 'selector', ->

            # @@

        describe 'self', ->

            # @@

    describe 'helper', ->

        describe 'clone', ->

            # @@
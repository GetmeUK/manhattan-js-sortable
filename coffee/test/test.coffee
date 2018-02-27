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

        describe 'when :nth-child(even)', ->

            it 'should return only even children', ->

                sortable.childSelector = ':nth-child(even)'

                children = Sortable.behaviours.children.selector(sortable)
                children.should.deep.equal [
                    listItems[1],
                    listItems[3],
                    listItems[5],
                    listItems[7]
                    ]

    describe 'grabSelector', ->

        describe 'when .grab', ->

            it 'should return the element within the child with with the grab
                class', ->

                grabber = $.create('span', {'class': 'grab'})
                li = listItems[0]
                li.appendChild(grabber)
                sortable.grabSelector = '.grab'

                children = Sortable.behaviours.grabber.selector(sortable, li)
                children.should.equal grabber


describe 'Sortable (behaviors)', ->

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

    describe 'before', ->

        describe 'auto', ->

            beforeEach ->

                # Provide a width for the container
                sortable.container.getBoundingClientRect = ()->
                    return {width: 100}

                # Set the axis option to an invalid value
                sortable.axis = 'unknown'

                # Set up a spy for the axis behaviour
                sinon.spy(Sortable.behaviours.before, 'axis')

            afterEach ->
                # Restore the axis behaviour
                Sortable.behaviours.before.axis.restore()

            describe 'when children are listed vertically', ->

                it 'should set the axis option to vertical', ->

                    _getBoundingRect = (i) ->
                        return () -> return {top: i * 10}

                    for li, i in listItems
                        li.getBoundingClientRect = _getBoundingRect(i)

                    Sortable.behaviours.before.auto(
                        sortable,
                        listItems[0],
                        [0, 0]
                        )
                    sortable.axis.should.equal 'vertical'

            describe 'when children are listed horizontally', ->

                it 'should set the axis option to horizontal', ->

                    for li, i in listItems
                        li.getBoundingClientRect = () -> return {top: 0}

                    Sortable.behaviours.before.auto(
                        sortable,
                        listItems[0],
                        [0, 0]
                        )
                    sortable.axis.should.equal 'horizontal'

            it 'should call the before > axis behaviour', ->

                for li, i in listItems
                    li.getBoundingClientRect = () -> return {top: 0}

                pos = [0, 0]
                Sortable.behaviours.before.auto(sortable, listItems[0], pos)

                axis = Sortable.behaviours.before.axis
                axis.should.have.been.calledWith(sortable, listItems[0], pos)

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

            describe 'when axis option is vertical', ->

                it 'should return true if the y position is less than half the
                    height of the sibling', ->

                    sortable.axis = 'vertical'

                    # Before
                    before = Sortable.behaviours.before.axis(
                        sortable,
                        li,
                        [0, 5]
                        )
                    before.should.be.true

                    # After
                    before = Sortable.behaviours.before.axis(
                        sortable,
                        li,
                        [0, 15]
                        )
                    before.should.be.false

            describe 'when axis option is horizontal', ->

                it 'should return true if the x position is less than half the
                    width of the sibling', ->

                    sortable.axis = 'horizontal'

                    # Before
                    before = Sortable.behaviours.before.axis(
                        sortable,
                        li,
                        [10, 0]
                        )
                    before.should.be.true

                    # After
                    before = Sortable.behaviours.before.axis(
                        sortable,
                        li,
                        [55, 0]
                        )
                    before.should.be.false


    describe 'children', ->

        describe 'children', ->

            it 'should return a list of the containers direct decendents', ->

                children = Sortable.behaviours.children.children(sortable)
                children.should.deep.equal listItems

        describe 'selector', ->

            it 'should return a list of the containers decendents based on the
                `childSelector` option', ->

                sortable.childSelector = ':nth-child(even)'

                children = Sortable.behaviours.children.selector(sortable)
                children.should.deep.equal [
                    listItems[1],
                    listItems[3],
                    listItems[5],
                    listItems[7]
                    ]

    describe 'grabber', ->

        describe 'selector', ->

            it 'should return a child from the element based on the
                `grabSelector` option', ->

                grabber = $.create('span', {'class': 'grab'})
                li = listItems[0]
                li.appendChild(grabber)
                sortable.grabSelector = '.grab'

                children = Sortable.behaviours.grabber.selector(sortable, li)
                children.should.equal grabber

        describe 'self', ->

            it 'should return the element passed', ->

                li = listItems[0]
                Sortable.behaviours.grabber.self(sortable, li).should.equal li

    describe 'helper', ->

        describe 'clone', ->

            it 'should return a clone of the element', ->

                li = listItems[0]
                clone = Sortable.behaviours.helper.clone(sortable, li)

                # Check it's a clone
                clone.tagName.should.equal li.tagName
                clone.innerHTML.should.equal li.innerHTML

                # Check the various helper styles and classes have been set
                clone.style.position.should.equal 'absolute'

                # Prevent the capture of pointer events
                clone.style['pointer-events'].should.equal 'none'

                # Add a helper class to the clone
                clone.classList.contains('mh-sortable-helper').should.be.true


describe 'Sortable (user interactions)', ->

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

        # Set up bounding client information for the container and all sortable
        # items.
        list.getBoundingClientRect = () -> return {
                bottom: 1000,
                height: 1000,
                left: 0,
                right: 1000,
                top: 0,
                width: 1000
                }

        _getBoundingRect = (i) ->
            return () -> return {
                bottom: (i * 10) + 20,
                height: 20,
                left: 0,
                right: 100,
                top: i * 10,
                width: 100
                }

        for li, i in listItems
            li.getBoundingClientRect = _getBoundingRect(i)

        # Set up the `elementFromPoint` behaviour for the document to always
        # return the second item in the list.
        document.elementFromPoint = (x, y) ->
            return listItems[1]

    afterEach ->
        sortable.destroy()
        document.body.removeChild(list)

    describe 'grabbing an item to move', ->

        it 'should dispatch a grabbed event against the container', ->

            listener = sinon.spy()
            list.addEventListener('mh-sortable--grabbed', listener)

            $.dispatch(
                listItems[0],
                'mousedown',
                {pageX: 5, pageY: 5, which: 1}
                )

            listener.should.have.been.calledOn list

            ev = listener.args[0][0]
            ev.child.should.equal listItems[0]

    describe 'moving an item to a new position', ->

        it 'should dispatch a sort event against the container', ->

            listener = sinon.spy()
            list.addEventListener('mh-sortable--sort', listener)

            # Grab the element
            $.dispatch(
                listItems[0],
                'mousedown',
                {pageX: 5, pageY: 5, which: 1}
                )

            # Move the element to a new position in the list
            $.dispatch(
                document,
                'mousemove',
                {pageX: 5, pageY: 35, which: 1}
                )

            listener.should.have.been.calledOn list

            ev = listener.args[0][0]
            ev.children.should.deep.equal [
                    listItems[1],
                    listItems[0],
                    listItems[2],
                    listItems[3],
                    listItems[4],
                    listItems[5],
                    listItems[6],
                    listItems[7],
                    listItems[8]
                ]

    describe 'dropping an item in a new position', ->

        it 'should dispatch a sorted event against the container', ->

            listener = sinon.spy()
            list.addEventListener('mh-sortable--sorted', listener)

            # Grab the element
            $.dispatch(
                listItems[0],
                'mousedown',
                {pageX: 5, pageY: 5, which: 1}
                )

            # Move the element to a new position in the list
            $.dispatch(
                document,
                'mousemove',
                {pageX: 5, pageY: 35, which: 1}
                )

            # Drop the element in its new new position in the list
            $.dispatch(
                document,
                'mouseup'
                )

            listener.should.have.been.calledOn list

            ev = listener.args[0][0]
            ev.children.should.deep.equal [
                    listItems[1],
                    listItems[0],
                    listItems[2],
                    listItems[3],
                    listItems[4],
                    listItems[5],
                    listItems[6],
                    listItems[7],
                    listItems[8]
                ]
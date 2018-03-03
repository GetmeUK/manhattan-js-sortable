import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Sortable} from '../module/index.js'

chai.should()
chai.use(require('sinon-chai'))


// Define a list of languages that we'll use to build sortable lists
const languages = [
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


describe('Sortable', () => {

    let list = null
    let listItems = null

    beforeEach(() => {
        // Build a list to sort
        list = $.create('ul', {'data-mh-sortable': true})
        listItems = []
        for (let language of languages) {
            let listItem = $.create('ul', {})
            listItem.innerText = language
            listItems.push(listItem)
            list.appendChild(listItem)
        }
        document.body.appendChild(list)
    })

    afterEach(() => {
        document.body.removeChild(list)
    })

    describe('constructor', () => {
        it('should generate a new `Sortable` instance', () => {
            const sortable = new Sortable(list)
            sortable.should.be.an.instanceof(Sortable)
        })
    })

    describe('getters & setters', () => {
        let li = null
        let sortable = null

        beforeEach(() => {
            [li] = listItems
            li.getBoundingClientRect = () => {
                return {
                    'bottom': 20,
                    'height': 20,
                    'left': 0,
                    'right': 100,
                    'top': 0,
                    'width': 100
                }
            }

            sortable = new Sortable(list)
            sortable.init()
        })

        afterEach(() => {
            sortable.destroy()
        })

        describe('children', () => {
            it('should return a list of sortable elements within the '
                + 'container', () => {
                const children = [...list.childNodes]
                sortable.children.should.deep.equal(children)
            })
        })

        describe('container', () => {
            it('should return the element that contains the sortable '
                + 'elements', () => {

                sortable.container.should.equal(list)
            })
        })

        describe('grabbed', () => {
            it('should return null if no element has been grabbed', () => {
                chai.expect(sortable.grabbed).to.be.null
            })
            it('should return the currently grabbed element', () => {
                [li] = list.childNodes
                $.dispatch(
                    li,
                    'mousedown',
                    {
                        'pageX': 10,
                        'pageY': 10,
                        'which': 1
                    }
                )
                sortable.grabbed.should.equal(li)
            })
        })
    })

    describe('public methods', () => {
        let sortable = null

        beforeEach(() => {
            sortable = new Sortable(list)
        })

        afterEach(() => {
            sortable.destroy()
        })

        describe('destroy', () => {
            it('should destroy the Sortable', () => {
                sortable.init()
                sortable.destroy()

                // Check the sortable class has been applied to container
                list.classList.contains(Sortable.css['sortable'])
                    .should
                    .be
                    .false

                // Check the the events required for sorting are being
                // listened for.
                sinon.spy(sortable, '_drag')
                sinon.spy(sortable, '_drop')
                sinon.spy(sortable, '_grab')

                $.dispatch(document, 'mousedown')
                $.dispatch(document, 'mousemove')
                $.dispatch(document, 'mouseup')

                sortable._drag.should.not.have.been.called
                sortable._drop.should.not.have.been.called
                sortable._grab.should.not.have.been.called
            })
        })

        describe('init', () => {
            it('should initialize the Sortable', () => {
                sortable.init()

                // Check the sortable class has been applied to container
                list.classList.contains(Sortable.css['sortable'])
                    .should
                    .be
                    .true

                // Check the the events required for sorting are being
                // listened for.
                sinon.spy(sortable, '_drag')
                sinon.spy(sortable, '_drop')
                sinon.spy(sortable, '_grab')

                $.dispatch(document, 'mousedown')
                $.dispatch(document, 'mousemove')
                $.dispatch(document, 'mouseup')

                sortable._drag.should.have.been.called
                sortable._drop.should.have.been.called
                sortable._grab.should.have.been.called
            })
        })
    })

    describe('private methods', () => {
        let li = null
        let li2 = null
        let sortable = null
        let {elementFromPoint} = document

        beforeEach(() => {
            [li, li2] = listItems
            li.getBoundingClientRect = () => {
                return {
                    'bottom': 20,
                    'height': 20,
                    'left': 0,
                    'right': 100,
                    'top': 0,
                    'width': 100
                }
            }
            li2.getBoundingClientRect = () => {
                return {
                    'bottom': 40,
                    'height': 20,
                    'left': 0,
                    'right': 100,
                    'top': 2,
                    'width': 100
                }
            }

            sortable = new Sortable(list)
            sortable.init()

            document.elementFromPoint = () => {
                return li2
            }
        })

        afterEach(() => {
            sortable.destroy()
            document.elementFromPoint = elementFromPoint
        })

        describe('_drag', () => {
            it('should drag an element on mousemove', () => {
                const onSort = sinon.spy()
                sinon.spy(sortable, '_drag')
                $.listen(list, {'sort': onSort})

                // Grab the first item in the list
                $.dispatch(
                    li,
                    'mousedown',
                    {
                        'pageX': 10,
                        'pageY': 10,
                        'which': 1
                    }
                )

                // Move the first list item below the second
                $.dispatch(
                    document,
                    'mousemove',
                    {
                        'pageX': 35,
                        'pageY': 35
                    }
                )

                // Check the sort method was called
                sortable._drag.should.have.been.called

                // @@ Start here
                // - Check position of helper
                // - Check order of children

                // Check the grabbed event was dispatched against container
                onSort.should.have.been.called
            })
        })

        // describe('_drop', () => {

        // })

        describe('_grab', () => {
            it('should grab an element to sort on mousedown', () => {
                const onGrabbed = sinon.spy()
                sinon.spy(sortable, '_grab')
                $.listen(list, {'grabbed': onGrabbed})

                // Grab the first item in the list
                $.dispatch(
                    li,
                    'mousedown',
                    {
                        'pageX': 10,
                        'pageY': 10,
                        'which': 1
                    }
                )

                // Check the grab method was called
                sortable._grab.should.have.been.called

                // Check the first list item was grabbed
                sortable.grabbed.should.equal(li)

                // Check the grabbed offset is set
                sortable._grabbedOffset.should.deep.equal([10, 10])

                // Check a helper element was created
                const {helper} = sortable._dom
                helper.should.exist
                helper.classList.contains(Sortable.css['helper'])
                    .should
                    .be
                    .true

                // Check the ghost class was applied to the grabbed element
                sortable.grabbed.classList.contains(Sortable.css['ghost'])
                    .should
                    .be
                    .true

                // Check the grabbed event was dispatched against container
                onGrabbed.should.have.been.called
            })

            it('should grab an element to sort on mousedown', () => {
                sinon.spy(sortable, '_grab')

                // Grab the first item in the list
                $.dispatch(
                    li,
                    'touchstart',
                    {
                        'touches': [
                            {
                                'pageX': 10,
                                'pageY': 10
                            }
                        ]
                    }
                )

                // Check the grab method was called
                sortable._grab.should.have.been.called

                // Check the first list item was grabbed
                sortable.grabbed.should.equal(li)

                // Check the grabbed offset is set
                sortable._grabbedOffset.should.deep.equal([10, 10])
            })
        })
    })
})

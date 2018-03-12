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
            let css = ''
            if (language.substring(0, 1) === 'J') {
                css = 'j'
            }
            let listItem = $.create('li', {'class': css})
            listItem.innerHTML = `${language}<div class="grab"></div>`
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

        describe('axis', () => {
            it('should return a the axis option for the sortable', () => {
                sortable.axis.should.equal('vertical')
            })

            it('should set a the axis option for the sortable', () => {
                sortable.axis = 'horizontal'
                sortable.axis.should.equal('horizontal')
            })
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

                // Check the the events listeners have been removed
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

                // Check the required event listeners have been added
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
                    'top': 20,
                    'width': 100
                }
            }

            sortable = new Sortable(list)
            sortable.init()

            document.elementFromPoint = (x, y) => {
                if (x === -1 && y === -1) {
                    return null
                } else if (x === 0 && y === 0) {
                    return li
                }
                return li2
            }
        })

        afterEach(() => {
            sortable.destroy()
            document.elementFromPoint = elementFromPoint
        })

        describe('_drag', () => {
            describe('drag the grabbed element on mousemove', () => {
                it('if should drag the first element after the '
                    + 'second', () => {

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
                            'pageX': 50,
                            'pageY': 50
                        }
                    )

                    // Check the sort method was called
                    sortable._drag.should.have.been.called

                    // Check the position of the helper
                    sortable._dom.helper.style.left.should.equal('40px')
                    sortable._dom.helper.style.top.should.equal('40px')

                    // Check the order of the children has been updated
                    list.childNodes[0].should.equal(li2)
                    list.childNodes[1].should.equal(li)

                    // Check the sort event was dispatched against container
                    onSort.should.have.been.called
                })

                it('if should drag the second element before the '
                    + 'first', () => {

                    // Grab the first item in the list
                    $.dispatch(
                        li2,
                        'mousedown',
                        {
                            'pageX': 50,
                            'pageY': 50,
                            'which': 1
                        }
                    )

                    // Move the first list item below the second
                    $.dispatch(
                        document,
                        'mousemove',
                        {
                            'pageX': 0,
                            'pageY': 0
                        }
                    )

                    // Check the order of the children has been updated
                    list.childNodes[0].should.equal(li2)
                    list.childNodes[1].should.equal(li)
                })
            })

            it('should sort the elements if the pointer is not over a '
                + 'sibling', () => {
                const onSort = sinon.spy()
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

                // Move the pointer but not over a sibling
                $.dispatch(
                    document,
                    'mousemove',
                    {
                        'pageX': -1,
                        'pageY': -1
                    }
                )

                // Check the sort event wasn't dispatched against container
                onSort.should.not.have.been.called
            })
        })

        describe('_drop', () => {
            it('should drop the grabbed element on mousemove', () => {
                const onSorted = sinon.spy()
                sinon.spy(sortable, '_drop')
                $.listen(list, {'sorted': onSorted})

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
                        'pageX': 50,
                        'pageY': 50
                    }
                )

                // Drop the element
                $.dispatch(
                    document,
                    'mouseup',
                    {
                        'pageX': 50,
                        'pageY': 50
                    }
                )

                // Check the sorted method was called
                sortable._drop.should.have.been.called

                // Check the grabbed element has been set to null
                chai.expect(sortable.grabbed).to.be.null

                // Check the helper element has been removed
                chai.expect($.one(`.${Sortable.css['helper']}`)).to.be.null

                // Check the sorting class has been removed from the list
                list.classList.contains(Sortable.css['sorting'])
                    .should
                    .be
                    .false

                // Check the ghost class has been removed from the grabbed
                // element.
                li.classList.contains(Sortable.css['ghost']).should.be.false

                // Check the order of the children has been updated
                list.childNodes[0].should.equal(li2)
                list.childNodes[1].should.equal(li)

                // Check the sorted event was dispatched against container
                onSorted.should.have.been.called
            })
        })

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

            it('should grab an element to sort on touchstart', () => {
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

            it('should only grab sortable elements', () => {
                // Grab the list
                $.dispatch(
                    list,
                    'mousedown',
                    {
                        'pageX': 10,
                        'pageY': 10,
                        'which': 1
                    }
                )
                chai.expect(sortable.grabbed).to.be.null
            })
        })
    })

    describe('behaviours > children', () => {
        const behaviours = Sortable.behaviours.children
        let sortable = null

        beforeEach(() => {
            sortable = new Sortable(list, {'childSelector': '.j'})
            sortable.init()
        })

        afterEach(() => {
            sortable.destroy()
        })

        describe('selector', () => {
            it('should return all child elements in the container', () => {
                let children = behaviours.selector(sortable)
                children.length.should.equal(2)
                children[0].textContent.should.equal('Java')
                children[1].textContent.should.equal('JavaScript')
            })
        })
    })

    describe('behaviours > grabber', () => {
        const behaviours = Sortable.behaviours.grabber
        let li = null
        let sortable = null

        beforeEach(() => {
            [li] = listItems
            sortable = new Sortable(
                list,
                {
                    'childSelector': '.j',
                    'grabSelector': '.grab'
                }
            )
            sortable.init()
        })

        afterEach(() => {
            sortable.destroy()
        })

        describe('selector', () => {
            it('should return an element matching the grabber selector from '
                + 'within the sortable element', () => {

                let grab = $.one('.grab', li)
                behaviours.selector(sortable, li).should.equal(grab)
            })
        })
    })

    describe('behaviours > place', () => {
        const behaviours = Sortable.behaviours.place
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
            sortable = new Sortable(
                list,
                {
                    'childSelector': '.j',
                    'grabSelector': '.grab'
                }
            )
            sortable.init()
        })

        afterEach(() => {
            sortable.axis = 'vertical'
            sortable.destroy()
        })

        describe('axis', () => {
            it('should return true the position is less than 50% the width '
                + 'of the sibling or false if equal or greater '
                + ' than 50%', () => {

                sortable.axis = 'vertical'
                behaviours.axis(sortable, li, [5, 5]).should.be.true
                behaviours.axis(sortable, li, [15, 15]).should.be.false

                sortable.axis = 'horizonal'
                behaviours.axis(sortable, li, [5, 5]).should.be.true
                behaviours.axis(sortable, li, [55, 5]).should.be.false

            })
        })
    })
})

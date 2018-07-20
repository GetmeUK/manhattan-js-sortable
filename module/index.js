import * as $ from 'manhattan-essentials'


// -- Utils --

/**
 * Return the `[x, y]` position of an event.
 */
function getEventPosition(event) {
    let _event = event
    if (event.touches) {
        [_event] = event.touches
    }
    return [
        _event.pageX - window.pageXOffset,
        _event.pageY - window.pageYOffset
    ]
}


// -- Class definition --

/**
 * Drag and drop sorting for DOM elements.
 */
export class Sortable {

    constructor(container, options={}, prefix='data-mh-sortable--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * The axis used to determine the placement of a grabbed
                 * element when placed over a sibling. Must be 'vertical'
                 * (top/bottom) or 'horizontal' (left/right).
                 */
                'axis': 'vertical',

                /**
                 * Used in conjunction with the `handle > children` behaviour
                 * to specify a CSS selector for the sortable children within
                 * the container.
                 */
                'childSelector': null,

                /**
                 * Used in conjuction with the `handle > grabber` behaviour to
                 * specify a CSS selector for the grabber element within a
                 * sortable child.
                 */
                'grabSelector': null

            },
            options,
            container,
            prefix
        )

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'children': 'children',
                'grabber': 'self',
                'helper': 'clone',
                'place': 'auto'
            },
            options,
            container,
            prefix
        )

        // The offset at which the currently grabbed element was grabbed
        this._grabbedOffset = null

        // Domain for related DOM elements
        this._dom = {
            'container': null,
            'grabbed': null,
            'helper': null
        }

        // Store a reference to the container
        this._dom.container = container

        // Domain for handlers
        this._handlers = {
            'drag': (event) => {
                this._drag(event)
            },
            'drop': (event) => {
                this._drop(event)
            },
            'grab': (event) => {
                this._grab(event)
            }
        }
    }

    // -- Getters & Setters --

    get axis() {
        return this._options.axis
    }

    set axis(value) {
        this._options.axis = value
    }

    get children() {
        const cls = this.constructor
        return cls.behaviours.children[this._behaviours.children](this)
    }

    get container() {
        return this._dom.container
    }

    get grabbed() {
        return this._dom.grabbed
    }

    // -- Public methods --

    /**
     * Remove the sortable.
     */
    destroy() {
        // Remove helper element
        if (this._dom.helper) {
            document.body.removeChild(this._dom.helper)
            delete this._dom.helper
        }

        // Remove sorting class
        this.container.classList.remove(this.constructor.css['sortable'])
        this.container.classList.remove(this.constructor.css['sorting'])

        // Remove event handlers
        $.ignore(
            document,
            {
                'mousedown': this._handlers.grab,
                'mousemove': this._handlers.drag,
                'mouseup': this._handlers.drop,
                'touchstart': this._handlers.grab,
                'touchmove': this._handlers.drag,
                'touchend': this._handlers.drop
            }
        )

        // Remove the sortable reference from the container
        delete this._dom.container._mhSortable
    }

    /**
     * Initialize the sortable.
     */
    init() {
        // Store a reference to the sortable instance against the container
        this._dom.container._mhSortable = this

        // Add the sortable class to the container
        this.container.classList.add(this.constructor.css['sortable'])

        // Set up event listeners
        $.listen(
            document,
            {
                'mousedown': this._handlers.grab,
                'mousemove': this._handlers.drag,
                'mouseup': this._handlers.drop,
                'touchstart': this._handlers.grab,
                'touchmove': this._handlers.drag,
                'touchend': this._handlers.drop
            }
        )
    }

    // -- Private methods --

    /**
     * Drag an element to a new position within its siblings.
     */
    _drag(event) {
        const cls = this.constructor

        // Ignore the event if an element hasn't been grabbed to sort
        if (this.grabbed === null) {
            return
        }

        // Move the helper inline with the pointer
        const position = getEventPosition(event)
        const offset = [
            window.pageXOffset,
            window.pageYOffset
        ]
        const leftPx = offset[0] + position[0] - this._grabbedOffset[0]
        const topPx = offset[1] + position[1] - this._grabbedOffset[1]
        this._dom.helper.style.left = `${leftPx}px`
        this._dom.helper.style.top = `${topPx}px`

        // Check if the pointer is over a sibling of the grabbed element
        const target = document.elementFromPoint(position[0], position[1])
        let sibling = null

        for (let child of this.children) {
            if (child !== this.grabbed && child.contains(target)) {
                sibling = child
                break
            }
        }

        // If the pointer is not over a sibling there's nothing more to do
        if (sibling === null) {
            return
        }

        // Moved the grabbed element into its new position within its siblings
        let before = cls.behaviours.place[this._behaviours.place](
            this,
            sibling,
            position
        )

        if (!before) {
            sibling = sibling.nextElementSibling
        }
        this.container.insertBefore(this.grabbed, sibling)

        // Dispatch sort event
        $.dispatch(this.container, 'sort', {'children': this.children})
    }

    /**
     * Drop an element into a new position within its siblings.
     */
    _drop(event) {
        const cls = this.constructor

        // Ignore the event if an element hasn't been grabbed to sort
        if (this.grabbed === null) {
            return
        }

        // Remove the ghost class from the grabbed element
        this.grabbed.classList.remove(cls.css['ghost'])
        this._dom.grabbed = null
        this._grabbedOffset = null

        // Remove the helper element
        this._dom.helper.parentNode.removeChild(this._dom.helper)
        delete this._dom.helper

        // Remove the sorting class from the container
        this.container.classList.remove(cls.css['sorting'])

        // Dispatch sorted event
        $.dispatch(this.container, 'sorted', {'children': this.children})
    }

    /**
     * Grab an element to sort.
     */
    _grab(event) {
        const cls = this.constructor

        // Check the event is using the primary mouse button (if the event
        // was trigger by a mouse).
        if (event.type.toLowerCase() === 'mousedown' && event.which !== 1) {
            return
        }

        // Check if the event relates to the grabber for a sortable element
        const grabber = cls.behaviours.grabber[this._behaviours.grabber]
        let grabbed = null
        for (let child of this.children) {
            const grabberElm = grabber(this, child)
            if (grabberElm && grabberElm.contains(event.target)) {
                grabbed = child
                break
            }
        }

        // If no element was grabbed there's nothing more to do
        if (grabbed === null) {
            return
        }

        // Cancel any default interaction
        event.preventDefault()

        // Set the grabbed element and its offset to the pointer
        const position = getEventPosition(event)
        const rect = grabbed.getBoundingClientRect()
        this._dom.grabbed = grabbed
        this._grabbedOffset = [
            position[0] - rect.left,
            position[1] - rect.top
        ]

        // Create a helper element to represent the grabbed element being
        // dragged.
        this._dom.helper = cls.behaviours.helper[this._behaviours.helper](
            this,
            this.grabbed
        )
        const leftPx = position[0] - this._grabbedOffset[0]
        const topPx = position[1] - this._grabbedOffset[1]
        this._dom.helper.style.left = `${leftPx}px`
        this._dom.helper.style.top = `${topPx}px`
        this._dom.helper.classList.add(cls.css['helper'])
        document.body.appendChild(this._dom.helper)

        // Add ghost class to the grabbed element
        this.grabbed.classList.add(cls.css['ghost'])

        // Add sorting class to the container
        this.container.classList.add(cls.css['sorting'])

        // Dispatch grabbed event
        $.dispatch(this.container, 'grabbed', {'grabbed': this.grabbed})
    }
}


// -- Behaviours --

Sortable.behaviours = {

    /**
     * The `children` behaviour is used to select the elements within the
     * `container` that will be sortable. Must return a list of DOM elements.
     */
    'children': {

        /**
         * Select all child elements of the container.
         */
        'children': (inst) => {
            const children = [...inst.container.childNodes]
            return children.filter((e) => {
                return e.nodeType === Node.ELEMENT_NODE
            })
        },

        /**
         * Select child elements using a CSS selector.
         */
        'selector': (inst) => {
            return $.many(inst._options.childSelector, inst.container)
        }

    },

    /**
     * The `grabber` behaviour is used to determine what part of a child
     * element is used to grab it when sorting.
     */
    'grabber': {

        /**
         * Select grabber element using a CSS selector
         */
        'selector': (inst, element) => {
            return $.one(inst._options.grabSelector, element)
        },

        /**
         * Return the element itself
         */
        'self': (inst, element) => {
            return element
        }

    },

    /**
     * The `helper` behaviour is used to generate a helper DOM element that
     * the user drags to position the related sortable child into a new
     * position.
     */
    'helper': {

        /**
         * Returns a cloned version of the element.
         */
        'clone': (inst, element) => {
            const clone = element.cloneNode(true)

            // Remove id attribute to avoid unwanted duplicates
            clone.removeAttribute('id')

            // Apply computed styles of the element to the cloned element
            clone.style.cssText = window.getComputedStyle(element).cssText

            // Set position and pointer events for the clone so that it will
            // behave as a helper.
            clone.style['position'] = 'absolute'
            clone.style['pointer-events'] = 'none'

            return clone
        }

    },

    /**
     * The `place` behaviour is used to determine if the grabbed element
     * should be placed before or after a given sibling element.
     */
    'place': {

        /**
         * Attempt to detect the correct axis to use based on the width of
         * child elements and the container, then call the 'axis' behaviour to
         * obtain a result.
         */
        'auto': (inst, sibling, position) => {
            // Default assumption is that we're sorting using the vertical
            // axis.
            inst._options.axis = 'vertical'

            // If any of the sortable children have the same vertical position
            // we switch the axis to sort horizontally.
            const tops = {}
            for (let child of inst.children) {
                let {top} = child.getBoundingClientRect()
                if (top in tops) {
                    inst._options.axis = 'horizontal'
                    break
                }
                tops[top] = true
            }

            return inst.constructor.behaviours.place.axis(
                inst,
                sibling,
                position
            )
        },

        /**
         * Determine if the element should be inserted before or after based
         * on the position being in one half or the other of the sibling
         * element.
         */
        'axis': (inst, sibling, position) => {
            const rect = sibling.getBoundingClientRect()
            const overlap = [
                position[0] - rect.left,
                position[1] - rect.top
            ]

            if (inst._options.axis === 'vertical') {
                return overlap[1] < (rect.height / 2)
            }
            return overlap[0] < (rect.width / 2)
        }

    }
}


// -- CSS classes --

Sortable.css = {

    /**
     * Applied to the element being sorted.
     */
    'ghost': 'mh-sortable-ghost',

    /**
     * Applied to helper element.
     */
    'helper': 'mh-sortable-helper',

    /**
     * Applied to the container element when the sortable behaviour is
     * initialized.
     */
    'sortable': 'mh-sortable',

    /**
     * Applied to the container when its children are being sorted.
     */
    'sorting': 'mh-sortable--sorting'

}

import * as $ from 'manhattan-essentials'


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
                // The axis used to determine the placement of a grabbed
                // element when placed over a sibling. Must be 'vertical'
                // (top/bottom) or 'horizontal' (left/right).
                'axis': 'vertical',

                // Used in conjunction with the `handle > children` behaviour
                // to specify a CSS selector for the sortable children within
                // the container.
                'childSelector': null,

                // Used in conjuction with the `handle > grabber` behaviour to
                // specify a CSS selector for the grabber element within a
                // sortable child.
                'grabSelector': null
            },
            options,
            input,
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
            input,
            prefix
        )

        // The element that is currently being sorted
        this._grabbed = null

        // The offset at which grabbed element was grabbed
        this._grabbedOffset

        // Domain for related DOM elements
        this._dom = {}

        // Store a reference to the container (we also store a reverse
        // reference to this instance against the container).
        this._dom.container = container
        this._dom.container._mhSortable = this
    }

    // -- Getters & Setters --

    get children() {
        const cls = this.constructor
        return cls.behaviours.children[this._behaviours.children](this)
    }

    get container() {
        return this._dom.container
    }

    get grabbed() {
        return this.grabbed
    }

    // -- Public methods --

    /**
     * Remove the sortable.
     */
    destroy() {

        // Remove sorting class
        this._dom.container.classList.remove(this.constructor.css['sortable'])
        this._dom.container.classList.remove(this.constructor.css['sorting'])

        // Remove event handlers
        $.ignore(
            document,
            {
                'mousedown': this._grab,
                'mousemove': this._drag,
                'mouseup': this._drop,
                'touchstart': this._grab,
                'touchmove': this._drag,
                'touchend': this._drop
            }
        )

        // Remove the sortable reference from the container
        delete this._dom.input._mhSortable
    }

    /**
     * Initialize the sortable.
     */
    init() {

        // Add the sortable class to the container
        this._dom.container.classList.add(this.constructor.css['sortable'])

        // Set up event listeners
        $.listen(
            document,
            {
                'mousedown': this._grab,
                'mousemove': this._drag,
                'mouseup': this._drop,
                'touchstart': this._grab,
                'touchmove': this._drag,
                'touchend': this._drop
            }
        )
    }

    // -- Private methods --

    /**
     * Return the `[x, y]` position of an event.
     */
    _getEventPosition(event) {
        let _event = event
        if (event.touches) {
            _event = event.touches
        }
        return [
            ev.pageX - window.pageXOffset,
            ev.pageY - window.pageYOffset
        ]
    }

    /**
     * Drag an element to a new position within its siblings.
     */
    _drag(event) {

        // Ignore the event if an element hasn't been grabbed to sort
        if (this.grabbed === null) {
            return
        }

        // Move the helper inline with the pointer
        const position = this._getEventPosition(event)
        const offset = [
            window.pageXOffset,
            window.pageYOffset
        ]
        const leftPx = offset[0] + position[0] - this._grabbedOffset[0]
        const topPx = offset[1] + position[1] - this._grabbedOffset[1]
        this._dom.helper.style.left = `${leftPx}px`
        this._dom.helper.style.top = `${topPX}px`

        // Check if the pointer is over a sibling of the grabbed element
        const target = document.elementFromPoint(position[0], position[1])
        let sibling = null

        for (let child of this.children) {
            if (child !== this._grabbed && child.contains(target)) {
                sibling = child
                break
            }
        }

        // If the pointer is not over a sibling there's nothing more to do
        if (sibling === null) {
            return
        }

        // Moved the grabbed element into its new position within its siblings
        let


    }

    /**
     * Drop an element into a new position within its siblings.
     */
    _drop(event) {

    }

    /**
     * Grab an element to sort.
     */
    _grab(event) {

        // @@ Add the helper CSS class to the helper
        // clone.classList.add(inst.constructor.css['helper'])
    }
}


// -- Behaviours --

CharacterCount.behaviours = {

    /**
     * The `children` behaviour is used to select the elements within the
     * `container` that will be sortable. Must return a list of DOM elements.
     */
    'children': {

        /**
         * Select all child elements of the container.
         */
        'children': (inst) => {
            const children = inst.container.childNodes
            return [
                for (e of children) if (e.nodeType === Node.ELEMENT_NODE) e
            ]
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
            const clone = elm.cloneNode(true)

            // Remove id attribute to avoid unwanted duplicates
            clone.removeAttribute('id')

            // Apply computed styles of the element to the cloned element
            clone.style.cssText = window.getComputedStyle(element).cssText

            // Set position and pointer events for the clone so that it will
            // behave as a helper.
            clone.style['position'] = 'absolute'
            clone.style['pointer-events'] = 'none'
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
            for (let child of inst._dom.children) {
                let top = child.getBoundingClientRect().top
                if (top in tops) {
                    inst._options.axis = 'horizontal'
                    break
                }
                tops[top] = true
            }

            return inst.constructor.behaviours['axis'](
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
            if (inst.axis === 'vertical') {
                return overlap[1] < (rect.height / 2)
            }
            return overlap[0] < (rect.width / 2)
        }

    }
}


// -- CSS classes --

CharacterCount.css = {

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
$ = require 'manhattan-essentials'


class Sortable

    # A class that provides 'sortable' behaviour for collections of elements.

    # The prefix that identifies attributes used to configure the plugin
    @clsPrefix: 'data-mh-sortable--'

    constructor: (container, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # The axis used to determine the placement of a grabbed element
                # when placed over a sibling. Must be 'vertical' (top/bottom) or
                # 'horizontal' (left/right).
                axis: 'vertical',

                # User in conjunction with the `handle > children` behaviour to
                # specify a CSS selector for the sortable children within the
                # container.
                childSelector: null,

                # Used in conjuction with the `handle > grabber` behaviour to
                # specify a CSS selector for the grabber element within a
                # sortable child.
                grabSelector: null
            },
            options,
            container,
            @constructor.clsPrefix
            )

        # Set up and configure behaviours
        @_behaviours = {}

        $.config(
            @_behaviours,
            {
                before: 'auto',
                children: 'children',
                grabber: 'self',
                helper: 'clone'
            },
            options,
            container,
            @constructor.clsPrefix
            )

        # The element that is currently being sorted
        @_grabbed = null

        # The offset at which the grabbed element was grabbed which is used to
        # allow the the helper to stay relative to the pointer.
        @_grabbedOffset = null

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the container the sortable is being applied to
        # (we also store a reverse reference to this instance against the
        # container).
        @_dom.container = container
        @_dom.container.__mh_sortable = this

        # Add a sortable class to the container
        @_dom.container.classList.add(@_bem('mh-sortable'))

        # Define read-only properties
        Object.defineProperty(this, 'container', {value: @_dom.container})
        Object.defineProperty(this, 'children', {
            get: () => return (c for c in @_dom.children)
        })

        # Select the container's sortable children
        children = @constructor.behaviours.children[@_behaviours.children]
        @_dom.children = children(this)

        # Handle interactions with sortable items
        $.listen document,

            # Mouse events
            'mousedown': @_grab,
            'mousemove': @_drag,
            'mouseup': @_drop,

            # Touch events
            'touchstart': @_grab,
            'touchmove': @_drag,
            'touchend': @_drop

    # Public methods

    destroy: () ->
        # Remove the sortable behaviour from the container

        # Remove the sortable class from the container
        @container.classList.remove(@_bem('mh-sortable'))

        # Remove event handlers
        $.ignore document,

            # Mouse events
            'mousedown': @_grab,
            'mousemove': @_drag,
            'mouseup': @_drop,

            # Touch events
            'touchstart': @_grab,
            'touchmove': @_drag,
            'touchend': @_drop

        # Remove the sortable reference from the container
        delete @_dom.container.__mh_sortable

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _clearSelection: () ->

    _et: (eventName) ->
        # Generate an event type name
        return "mh-sortable--#{eventName}"

    _getEventPos: (ev) ->
        # Return the `[x, y]` coordinates for an event
        if (ev.touches)
            ev = ev.touches[0]
        return [ev.pageX - window.pageXOffset, ev.pageY - window.pageYOffset]

    # Sort event handlers.
    #
    # NOTE: Fat arrows are used for these methods as they require the parent
    # `Sortable` instance as their scope but are called as event listeners.

    _drag: (ev) =>
        # Handle the grabbed element being dragged to a new position

        # We only handle this event if a sortable child has been grabbed
        if not @_grabbed
            return

        # Get the position of the pointer
        pos = @_getEventPos(ev)

        # Move the helper inline with the pointer
        offset = [window.pageXOffset, window.pageYOffset]
        @_dom.helper.style.left = "#{offset[0] + pos[0] - @_grabbedOffset[0]}px"
        @_dom.helper.style.top = "#{offset[1] + pos[1] - @_grabbedOffset[1]}px"

        # Is the pointer over sibling of the grabbed element?
        target = document.elementFromPoint(pos[0], pos[1])
        sibling = null
        for child in @_dom.children

            # Ignore the currently grabbed item
            if child is @_grabbed
                continue

            if child.contains(target)
                sibling = child
                break

        if not sibling
            return

        # Move the grabbed element into its new position
        before = @constructor.behaviours.before[@_behaviours.before]
        before = before(this, sibling, pos)
        @container.removeChild(@_grabbed)
        if not before
            sibling = sibling.nextElementSibling
        @container.insertBefore(@_grabbed, sibling)

        # Update the list of sortable children
        children = @constructor.behaviours.children[@_behaviours.children]
        @_dom.children = children(this)

        # Dispatch a sort event
        $.dispatch(@container, @_et('sort'), {'children': @_dom.children})

    _drop: (ev) =>
        # Handle the grabbed element being dropped into a new position

        # We only handle this event if a sortable child has been grabbed
        if not @_grabbed
            return

        # Remove the ghost class from the grabbed element
        @_grabbed.classList.remove(@_bem('mh-sortable-ghost'))
        @_grabbed = null
        @_grabbedOffset = null

        # Remove the helper element
        document.body.removeChild(@_dom.helper)
        @_dom.helper = null

        # Remove the sorting class from the container
        @container.classList.remove(@_bem('mh-sortable', null, 'sorting'))

        # Dispatch a sorted event
        $.dispatch(@container, @_et('sorted'), {'children': @_dom.children})

    _grab: (ev) =>
        # Handle the grabbing of an element to sort

        # If this is a mouse down event then we check that the user pressed the
        # primary mouse button (left).
        if ev.type.toLowerCase() is 'mousedown' and not (ev.which is 1)
            return

        # Determine if the target of the event relates to the grabber for a
        # sortable child.
        grabbed = null
        for child in @_dom.children

            grabber = @constructor.behaviours.grabber[@_behaviours.grabber]
            if grabber(this, child).contains(ev.target)
                grabbed = child
                break

        # Store any grabbed element and trigger the grabbed event
        if grabbed
            ev.preventDefault()

            # Store grabbed child
            @_grabbed = grabbed

            # Get x, y for event
            pos = @_getEventPos(ev)

            # Store the offset at which we grabbed the child
            rect = @_grabbed.getBoundingClientRect()
            @_grabbedOffset = [pos[0] - rect.left, pos[1] - rect.top]

            # Create a helper to represent the grabbed child being dragged
            helper = @constructor.behaviours.helper[@_behaviours.helper]
            @_dom.helper = helper(this, @_grabbed)
            document.body.appendChild(@_dom.helper)

            # Move the helper inline with the pointer
            @_dom.helper.style.left = "#{pos[0] - @_grabbedOffset[0]}px"
            @_dom.helper.style.top = "#{pos[1] - @_grabbedOffset[1]}px"

            # Add the ghost class to the grabbed child to change its appearance
            # within the list.
            @_grabbed.classList.add(@_bem('mh-sortable-ghost'))

            # Add a class to the container to indicate that the user is sorting
            # the list.
            @container.classList.add(@_bem('mh-sortable', null, 'sorting'))

            # Dispatch grabbed event
            $.dispatch(@container, @_et('grabbed'), {'child': grabbed})

    # Behaviours

    @behaviours:

        # The `before` behaviour is used to determine if the grabbed element
        # should be placed before or after a given sibling element.
        before:
            'auto': (sortable, sibling, pos) ->
                # Attempt to detect the correct axis to use based on the width
                # of child elements and the container, then call the 'axis'
                # behaviour to obtain a result.

                # Has the container width changed since we last called this
                # behaviour?
                width = sortable.container.getBoundingClientRect().width
                unless sortable._containerWidth is width

                    # Width has changed, attempt to detect the correct axis
                    sortable.axis = 'vertical'

                    # Check if any child has the same top position, if so
                    # switch to a horizontal axis.
                    topTable = {}
                    for child in sortable._dom.children
                        top = child.getBoundingClientRect().top

                        if topTable[top]
                            sortable.axis = 'horizontal'
                            break
                        topTable[top] = true

                    # Store new container width
                    sortable._containerWidth = width

                axis = sortable.constructor.behaviours.before['axis']
                return axis(sortable, sibling, pos)

            'axis': (sortable, sibling, pos) ->
                # Determine if the element should be inserted before or after
                # based on the position being in one half or the other of the
                # sibling element.
                rect = sibling.getBoundingClientRect()
                overlap = [pos[0] - rect.left, pos[1] - rect.top]
                if sortable.axis is 'vertical'
                    return overlap[1] < (rect.height / 2)
                return overlap[0] < (rect.width / 2)

        # The `children` behaviour is used to select the elements within the
        # `container` that will be sortable. Must return a list of DOM elements.
        children:
            'children': (sortable) ->
                # Select all child elements of the container
                children = sortable.container.childNodes
                elementType = 1 # (Node.ELEMENT_NODE)
                return (e for e in children when e.nodeType is elementType)

            'selector': (sortable) ->
                # Select child elements using a CSS selector
                return $.many(sortable.childSelector, sortable.container)

        # The `grabber` behaviour is used to determine what part of a child
        # element is used to grab it when sorting.
        grabber:
            'selector': (sortable, elm) ->
                # Select grabber element using a CSS selector
                return $.one(sortable.grabSelector, elm)

            'self': (sortable, elm) ->
                # Return the element itself
                return elm

        # The `helper` behaviour is used to generate a helper DOM element that
        # the user drags to position the related sortable child into a new
        # position.

        helper:
            'clone': (sortable, elm) ->
                # Returns a cloned version of the element

                # Clone the node
                cloned = elm.cloneNode(true)

                # Remove any `id` or `name` attribute to prevent unwanted
                # duplicates.
                cloned.removeAttribute('id')
                cloned.removeAttribute('name')

                # Copy CSS styles of the to the cloned element
                css = document.defaultView.getComputedStyle(elm, '').cssText
                cloned.style.cssText = css

                # Set the position of the helper element to be absolute
                cloned.style.position = 'absolute'

                # Prevent the capture of pointer events
                cloned.style['pointer-events'] = 'none'

                # Add a helper class to the clone
                cloned.classList.add(sortable._bem('mh-sortable-helper'))

                return cloned


module.exports = {Sortable: Sortable}
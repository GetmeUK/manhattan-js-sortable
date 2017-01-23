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
                # User in conjunction with the `handle > children` behaviour to
                # specify a CSS selector for the sortable children within the
                # container.
                childSelector: null

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
                children: 'children',
                grabber: 'self'
            },
            options,
            container,
            @constructor.clsPrefix
            )

        # The element that is currently being sorted
        @_grabbed = null

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the container the sortable is being applied to
        # (we also store a reverse reference to this instance against the
        # container).
        @_dom.container = container
        @_dom.container.__mh_sortable = this

        # Define read-only properties
        Object.defineProperty(this, 'container', {value: @_dom.container})

        # Select the container's sortable children
        children = @constructor.behaviours.children[@_behaviours.children]
        @_dom.children = children(this)

        # Handle interactions with the container
        $.listen @container,

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

    # Sort event handlers.
    #
    # NOTE: Fat arrows are used for these methods as they require the parent
    # `Sortable` instance as their scope but are called as event listeners.

    _drag: (ev) =>
        # Handle the grabbed element being dragged to a new position

        # We only handle this event if a sortable child has been grabbed
        if not @_grabbed
            return

        ev.preventDefault()

    _drop: (ev) =>
        @todo = 'todo'

    _grab: (ev) =>
        # Handle the grabbing of an element to sort

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

            # @@ START HERE

            # @@ Create a helper to represent the grabbed child being dragged

            # @@ Apply the ghost class to the grabbed child to change it's
            # appearance within the list.

            # Trigger grabbed event
            $.dispatch(@container, @_et('grabbed'), {'target': grabbed})

    # Behaviours

    @behaviours:

        # The `children` behaviour is used to select the elements within the
        # `container` that will be sortable. Must return a list of DOM elements.
        children:
            'children': (sortable) ->
                # Select all child elements of the container
                children = sortable.container.childNodes
                elementType = Node.ELEMENT_NODE
                return (e for e in children when e.nodeType is elementType)

            'selector': (sortable) ->
                # Select child elements using a CSS selector
                return $.many(sortable.childSelector, sortable.container)

        grabber:
            # The `grabber` behaviour is used to determine what part of a child
            # element is used to grab it when sorting.
            'selector': (sortable, elm) ->
                # Select grabber element using a CSS selector
                return $.many(sortable.grabSelector, elm)

            'self': (sortable, elm) ->
                # Return the element itself
                return elm


module.exports = {Sortable: Sortable}


# Config
#
# ghost class
# grabbed class

# behaviours
#
# - helper (clone): how to generate a clone of the element being sorted

# events
#
# - change (when the order of elements is changed)

# Process
#
#   -> grab (click or touch)
#   -> pick up (drag)
#   -> move (move to another location in the list)
#   -> drop

# TODO:
#
# - Prevent text selection
<div align="center">
    <img width="196" height="96" vspace="20" src="http://assets.getme.co.uk/manhattan-logo--variation-b.svg">
    <h1>Manhattan Sortable</h1>
    <p>Drag and drop sorting for DOM elements.</p>
    <a href="https://badge.fury.io/js/manhattan-sortable"><img src="https://badge.fury.io/js/manhattan-sortable.svg" alt="npm version" height="18"></a>
    <a href="https://travis-ci.org/GetmeUK/manhattan-js-sortable"><img src="https://travis-ci.org/GetmeUK/manhattan-js-sortable.svg?branch=master" alt="Build Status" height="18"></a>
    <a href='https://coveralls.io/github/GetmeUK/manhattan-js-sortable?branch=master'><img src='https://coveralls.io/repos/github/GetmeUK/manhattan-js-sortable/badge.svg?branch=master' alt='Coverage Status' height="18"/></a>
    <a href="https://david-dm.org/GetmeUK/manhattan-js-sortable/"><img src='https://david-dm.org/GetmeUK/manhattan-js-sortable/status.svg' alt='dependencies status' height="18"/></a>
</div>

## Installation

`npm install manhattan-sortable --save-dev`


## Usage

```JavaScript
import * as $ from 'manhattan-essentials'
import {Sortable} from 'manhattan-sortable'

let sortable = Sortable(SomeListElement)
sortable.init()
```

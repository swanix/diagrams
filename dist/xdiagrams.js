/**
 * @swanix/diagrams v0.9.1
 */
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function")
    select2 = arrayAll(select2);
  else
    select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$2(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function")
    value = constant$2(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter)
      enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update)
      update = update.selection();
  }
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare)
    compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node)
        return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event2) {
    listener.call(this, event2, this.__data__);
  };
}
function parseTypenames$1(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event2 = window2.CustomEvent;
  if (typeof event2 === "function") {
    event2 = new event2(type, params);
  } else {
    event2 = window2.document.createEvent("Event");
    if (params)
      event2.initEvent(type, params.bubbles, params.cancelable), event2.detail = params.detail;
    else
      event2.initEvent(type, false, false);
  }
  node.dispatchEvent(event2);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i])
        yield node;
    }
  }
}
var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function sourceEvent(event2) {
  let sourceEvent2;
  while (sourceEvent2 = event2.sourceEvent)
    event2 = sourceEvent2;
  return event2;
}
function pointer(event2, node) {
  event2 = sourceEvent(event2);
  if (node === void 0)
    node = event2.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event2.clientX, point.y = event2.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event2.clientX - rect.left - node.clientLeft, event2.clientY - rect.top - node.clientTop];
    }
  }
  return [event2.pageX, event2.pageY];
}
function selectAll(selector2) {
  return typeof selector2 === "string" ? new Selection$1([document.querySelectorAll(selector2)], [document.documentElement]) : new Selection$1([array(selector2)], root);
}
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
      throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n)
        if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name)))
          return t;
      return;
    }
    if (callback != null && typeof callback !== "function")
      throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type)
        _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null)
        for (t in _)
          _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _)
      copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0)
      for (var args = new Array(n), i = 0, n, t; i < n; ++i)
        args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null)
    type.push({ name, value: callback });
  return type;
}
const nonpassivecapture = { capture: true, passive: false };
function noevent$1(event2) {
  event2.preventDefault();
  event2.stopImmediatePropagation();
}
function dragDisable(view) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0)
    h = s = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s = NaN;
  else if (s <= 0)
    h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Hsl();
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
  if (s) {
    if (r === max)
      h = (g - b) / s + (g < b) * 6;
    else if (g === max)
      h = (b - r) / s + 2;
    else
      h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const constant$1 = (x) => () => x;
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
}
const interpolateRgb = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
}(1);
function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i])
        s[i] += bm;
      else
        s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i])
      s[i] += bs;
    else
      s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2)
      s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}
var degrees = 180 / Math.PI;
var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b))
    a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d)
    c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d))
    c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c)
    a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null)
    return identity$1;
  if (!svgNode)
    svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate()))
    return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180)
        b += 360;
      else if (b - a > 180)
        a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
const interpolateZoom = function zoomRho(rho, rho2, rho4) {
  function zoom2(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
}(Math.SQRT2, 2, 4);
var frame = 0, timeout$2 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function")
      throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail)
        taskTail._next = this;
      else
        taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0)
      t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$2 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay)
    clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time)
        time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame)
    return;
  if (timeout$2)
    timeout$2 = clearTimeout(timeout$2);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity)
      timeout$2 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval)
      interval = clearInterval(interval);
  } else {
    if (!interval)
      clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
function timeout$1(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules)
    node.__transition = {};
  else if (id2 in schedules)
    return;
  create(node, id2, {
    name,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED)
    throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED)
    throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2]))
    throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self2) {
  var schedules = node.__transition, tween;
  schedules[id2] = self2;
  self2.timer = timer(schedule2, 0, self2.time);
  function schedule2(elapsed) {
    self2.state = SCHEDULED;
    self2.timer.restart(start2, self2.delay, self2.time);
    if (self2.delay <= elapsed)
      start2(elapsed - self2.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self2.state !== SCHEDULED)
      return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self2.name)
        continue;
      if (o.state === STARTED)
        return timeout$1(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout$1(function() {
      if (self2.state === STARTED) {
        self2.state = RUNNING;
        self2.timer.restart(tick, self2.delay, self2.time);
        tick(elapsed);
      }
    });
    self2.state = STARTING;
    self2.on.call("start", node, node.__data__, self2.index, self2.group);
    if (self2.state !== STARTING)
      return;
    self2.state = STARTED;
    tween = new Array(n = self2.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self2.tween[i].value.call(node, node.__data__, self2.index, self2.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self2.duration ? self2.ease.call(null, elapsed / self2.duration) : (self2.timer.restart(stop), self2.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self2.state === ENDING) {
      self2.on.call("end", node, node.__data__, self2.index, self2.group);
      stop();
    }
  }
  function stop() {
    self2.state = ENDED;
    self2.timer.stop();
    delete schedules[id2];
    for (var i in schedules)
      return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules)
    return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2)
    delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function")
    throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n)
        tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function")
    throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function")
      throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function")
    throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id)
    throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0)
      t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0)
      (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition)
      if (+i !== id2)
        return;
    if (parent)
      parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null)
      string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event2 = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener)
      (on1 = (on0 = on).copy()).on(event2, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0)
        resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0)
      resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicOut(t) {
  return --t * t * t + 1;
}
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const constant = (x) => () => x;
function ZoomEvent(type, {
  sourceEvent: sourceEvent2,
  target,
  transform: transform2,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform2, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom)
    if (!(node = node.parentNode))
      return identity;
  return node.__zoom;
}
function nopropagation(event2) {
  event2.stopImmediatePropagation();
}
function noevent(event2) {
  event2.preventDefault();
  event2.stopImmediatePropagation();
}
function defaultFilter(event2) {
  return (!event2.ctrlKey || event2.type === "wheel") && !event2.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity;
}
function defaultWheelDelta(event2) {
  return -event2.deltaY * (event2.deltaMode === 1 ? 0.05 : event2.deltaMode ? 1 : 2e-3) * (event2.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform2, extent, translateExtent) {
  var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
  return transform2.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom() {
  var filter2 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom2(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom2.transform = function(collection, transform2, point, event2) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform2, point, event2);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event2).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
      });
    }
  };
  zoom2.scaleBy = function(selection2, k, p, event2) {
    zoom2.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event2);
  };
  zoom2.scaleTo = function(selection2, k, p, event2) {
    zoom2.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event2);
  };
  zoom2.translateBy = function(selection2, x, y, event2) {
    zoom2.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event2);
  };
  zoom2.translateTo = function(selection2, x, y, p, event2) {
    zoom2.transform(selection2, function() {
      var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event2);
  };
  function scale(transform2, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
  }
  function translate(transform2, p0, p1) {
    var x = p0[0] - p1[0] * transform2.k, y = p0[1] - p1[1] * transform2.k;
    return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
  }
  function centroid(extent2) {
    return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
  }
  function schedule2(transition, transform2, point, event2) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event2).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event2).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event2), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate2(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1)
          t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event2) {
      if (event2)
        this.sourceEvent = event2;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform2) {
      if (this.mouse && key !== "mouse")
        this.mouse[1] = transform2.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch")
        this.touch0[1] = transform2.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch")
        this.touch1[1] = transform2.invert(this.touch1[0]);
      this.that.__zoom = transform2;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom2,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event2, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var g = gesture(this, args).event(event2), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event2);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k)
      return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event2);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event2, ...args) {
    if (touchending || !filter2.apply(this, arguments))
      return;
    var currentTarget = event2.currentTarget, g = gesture(this, args, true).event(event2), v = select(event2.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event2, currentTarget), x0 = event2.clientX, y0 = event2.clientY;
    dragDisable(event2.view);
    nopropagation(event2);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event3) {
      noevent(event3);
      if (!g.moved) {
        var dx = event3.clientX - x0, dy = event3.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event3).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event3, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event3) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event3.view, g.moved);
      noevent(event3);
      g.event(event3).end();
    }
  }
  function dblclicked(event2, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var t0 = this.__zoom, p0 = pointer(event2.changedTouches ? event2.changedTouches[0] : event2, this), p1 = t0.invert(p0), k1 = t0.k * (event2.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    noevent(event2);
    if (duration > 0)
      select(this).transition().duration(duration).call(schedule2, t1, p0, event2);
    else
      select(this).call(zoom2.transform, t1, p0, event2);
  }
  function touchstarted(event2, ...args) {
    if (!filter2.apply(this, arguments))
      return;
    var touches = event2.touches, n = touches.length, g = gesture(this, args, event2.changedTouches.length === n).event(event2), started, i, t, p;
    nopropagation(event2);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0)
        g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2])
        g.touch1 = p, g.taps = 0;
    }
    if (touchstarting)
      touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2)
        touchfirst = p[0], touchstarting = setTimeout(function() {
          touchstarting = null;
        }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event2, ...args) {
    if (!this.__zooming)
      return;
    var g = gesture(this, args).event(event2), touches = event2.changedTouches, n = touches.length, i, t, p, l;
    noevent(event2);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier)
        g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier)
        g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0)
      p = g.touch0[0], l = g.touch0[1];
    else
      return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event2, ...args) {
    if (!this.__zooming)
      return;
    var g = gesture(this, args).event(event2), touches = event2.changedTouches, n = touches.length, i, t;
    nopropagation(event2);
    if (touchending)
      clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier)
        delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier)
        delete g.touch1;
    }
    if (g.touch1 && !g.touch0)
      g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0)
      g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p)
            p.apply(this, arguments);
        }
      }
    }
  }
  zoom2.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom2) : wheelDelta;
  };
  zoom2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), zoom2) : filter2;
  };
  zoom2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom2) : touchable;
  };
  zoom2.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom2) : extent;
  };
  zoom2.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom2) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom2.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom2) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom2.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom2) : constrain;
  };
  zoom2.duration = function(_) {
    return arguments.length ? (duration = +_, zoom2) : duration;
  };
  zoom2.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom2) : interpolate2;
  };
  zoom2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom2 : value;
  };
  zoom2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom2) : Math.sqrt(clickDistance2);
  };
  zoom2.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom2) : tapDistance;
  };
  return zoom2;
}
function count(node) {
  var sum = 0, children2 = node.children, i = children2 && children2.length;
  if (!i)
    sum = 1;
  else
    while (--i >= 0)
      sum += children2[i].value;
  node.value = sum;
}
function node_count() {
  return this.eachAfter(count);
}
function node_each(callback, that) {
  let index = -1;
  for (const node of this) {
    callback.call(that, node, ++index, this);
  }
  return this;
}
function node_eachBefore(callback, that) {
  var node = this, nodes = [node], children2, i, index = -1;
  while (node = nodes.pop()) {
    callback.call(that, node, ++index, this);
    if (children2 = node.children) {
      for (i = children2.length - 1; i >= 0; --i) {
        nodes.push(children2[i]);
      }
    }
  }
  return this;
}
function node_eachAfter(callback, that) {
  var node = this, nodes = [node], next = [], children2, i, n, index = -1;
  while (node = nodes.pop()) {
    next.push(node);
    if (children2 = node.children) {
      for (i = 0, n = children2.length; i < n; ++i) {
        nodes.push(children2[i]);
      }
    }
  }
  while (node = next.pop()) {
    callback.call(that, node, ++index, this);
  }
  return this;
}
function node_find(callback, that) {
  let index = -1;
  for (const node of this) {
    if (callback.call(that, node, ++index, this)) {
      return node;
    }
  }
}
function node_sum(value) {
  return this.eachAfter(function(node) {
    var sum = +value(node.data) || 0, children2 = node.children, i = children2 && children2.length;
    while (--i >= 0)
      sum += children2[i].value;
    node.value = sum;
  });
}
function node_sort(compare) {
  return this.eachBefore(function(node) {
    if (node.children) {
      node.children.sort(compare);
    }
  });
}
function node_path(end) {
  var start2 = this, ancestor = leastCommonAncestor(start2, end), nodes = [start2];
  while (start2 !== ancestor) {
    start2 = start2.parent;
    nodes.push(start2);
  }
  var k = nodes.length;
  while (end !== ancestor) {
    nodes.splice(k, 0, end);
    end = end.parent;
  }
  return nodes;
}
function leastCommonAncestor(a, b) {
  if (a === b)
    return a;
  var aNodes = a.ancestors(), bNodes = b.ancestors(), c = null;
  a = aNodes.pop();
  b = bNodes.pop();
  while (a === b) {
    c = a;
    a = aNodes.pop();
    b = bNodes.pop();
  }
  return c;
}
function node_ancestors() {
  var node = this, nodes = [node];
  while (node = node.parent) {
    nodes.push(node);
  }
  return nodes;
}
function node_descendants() {
  return Array.from(this);
}
function node_leaves() {
  var leaves = [];
  this.eachBefore(function(node) {
    if (!node.children) {
      leaves.push(node);
    }
  });
  return leaves;
}
function node_links() {
  var root2 = this, links = [];
  root2.each(function(node) {
    if (node !== root2) {
      links.push({ source: node.parent, target: node });
    }
  });
  return links;
}
function* node_iterator() {
  var node = this, current, next = [node], children2, i, n;
  do {
    current = next.reverse(), next = [];
    while (node = current.pop()) {
      yield node;
      if (children2 = node.children) {
        for (i = 0, n = children2.length; i < n; ++i) {
          next.push(children2[i]);
        }
      }
    }
  } while (next.length);
}
function hierarchy(data, children2) {
  if (data instanceof Map) {
    data = [void 0, data];
    if (children2 === void 0)
      children2 = mapChildren;
  } else if (children2 === void 0) {
    children2 = objectChildren;
  }
  var root2 = new Node(data), node, nodes = [root2], child, childs, i, n;
  while (node = nodes.pop()) {
    if ((childs = children2(node.data)) && (n = (childs = Array.from(childs)).length)) {
      node.children = childs;
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = childs[i] = new Node(childs[i]));
        child.parent = node;
        child.depth = node.depth + 1;
      }
    }
  }
  return root2.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(d) {
  return d.children;
}
function mapChildren(d) {
  return Array.isArray(d) ? d[1] : null;
}
function copyData(node) {
  if (node.data.value !== void 0)
    node.value = node.data.value;
  node.data = node.data.data;
}
function computeHeight(node) {
  var height = 0;
  do
    node.height = height;
  while ((node = node.parent) && node.height < ++height);
}
function Node(data) {
  this.data = data;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: node_count,
  each: node_each,
  eachAfter: node_eachAfter,
  eachBefore: node_eachBefore,
  find: node_find,
  sum: node_sum,
  sort: node_sort,
  path: node_path,
  ancestors: node_ancestors,
  descendants: node_descendants,
  leaves: node_leaves,
  links: node_links,
  copy: node_copy,
  [Symbol.iterator]: node_iterator
};
function defaultSeparation(a, b) {
  return a.parent === b.parent ? 1 : 2;
}
function nextLeft(v) {
  var children2 = v.children;
  return children2 ? children2[0] : v.t;
}
function nextRight(v) {
  var children2 = v.children;
  return children2 ? children2[children2.length - 1] : v.t;
}
function moveSubtree(wm, wp, shift) {
  var change = shift / (wp.i - wm.i);
  wp.c -= change;
  wp.s += shift;
  wm.c += change;
  wp.z += shift;
  wp.m += shift;
}
function executeShifts(v) {
  var shift = 0, change = 0, children2 = v.children, i = children2.length, w;
  while (--i >= 0) {
    w = children2[i];
    w.z += shift;
    w.m += shift;
    shift += w.s + (change += w.c);
  }
}
function nextAncestor(vim, v, ancestor) {
  return vim.a.parent === v.parent ? vim.a : ancestor;
}
function TreeNode(node, i) {
  this._ = node;
  this.parent = null;
  this.children = null;
  this.A = null;
  this.a = this;
  this.z = 0;
  this.m = 0;
  this.c = 0;
  this.s = 0;
  this.t = null;
  this.i = i;
}
TreeNode.prototype = Object.create(Node.prototype);
function treeRoot(root2) {
  var tree2 = new TreeNode(root2, 0), node, nodes = [tree2], child, children2, i, n;
  while (node = nodes.pop()) {
    if (children2 = node._.children) {
      node.children = new Array(n = children2.length);
      for (i = n - 1; i >= 0; --i) {
        nodes.push(child = node.children[i] = new TreeNode(children2[i], i));
        child.parent = node;
      }
    }
  }
  (tree2.parent = new TreeNode(null, 0)).children = [tree2];
  return tree2;
}
function tree() {
  var separation = defaultSeparation, dx = 1, dy = 1, nodeSize = null;
  function tree2(root2) {
    var t = treeRoot(root2);
    t.eachAfter(firstWalk), t.parent.m = -t.z;
    t.eachBefore(secondWalk);
    if (nodeSize)
      root2.eachBefore(sizeNode);
    else {
      var left = root2, right = root2, bottom = root2;
      root2.eachBefore(function(node) {
        if (node.x < left.x)
          left = node;
        if (node.x > right.x)
          right = node;
        if (node.depth > bottom.depth)
          bottom = node;
      });
      var s = left === right ? 1 : separation(left, right) / 2, tx = s - left.x, kx = dx / (right.x + s + tx), ky = dy / (bottom.depth || 1);
      root2.eachBefore(function(node) {
        node.x = (node.x + tx) * kx;
        node.y = node.depth * ky;
      });
    }
    return root2;
  }
  function firstWalk(v) {
    var children2 = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
    if (children2) {
      executeShifts(v);
      var midpoint = (children2[0].z + children2[children2.length - 1].z) / 2;
      if (w) {
        v.z = w.z + separation(v._, w._);
        v.m = v.z - midpoint;
      } else {
        v.z = midpoint;
      }
    } else if (w) {
      v.z = w.z + separation(v._, w._);
    }
    v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
  }
  function secondWalk(v) {
    v._.x = v.z + v.parent.m;
    v.m += v.parent.m;
  }
  function apportion(v, w, ancestor) {
    if (w) {
      var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
      while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
        vom = nextLeft(vom);
        vop = nextRight(vop);
        vop.a = v;
        shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
        if (shift > 0) {
          moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
          sip += shift;
          sop += shift;
        }
        sim += vim.m;
        sip += vip.m;
        som += vom.m;
        sop += vop.m;
      }
      if (vim && !nextRight(vop)) {
        vop.t = vim;
        vop.m += sim - sop;
      }
      if (vip && !nextLeft(vom)) {
        vom.t = vip;
        vom.m += sip - som;
        ancestor = v;
      }
    }
    return ancestor;
  }
  function sizeNode(node) {
    node.x *= dx;
    node.y = node.depth * dy;
  }
  tree2.separation = function(x) {
    return arguments.length ? (separation = x, tree2) : separation;
  };
  tree2.size = function(x) {
    return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree2) : nodeSize ? null : [dx, dy];
  };
  tree2.nodeSize = function(x) {
    return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree2) : nodeSize ? [dx, dy] : null;
  };
  return tree2;
}
let d3$2;
if (typeof window !== "undefined" && window.d3) {
  d3$2 = window.d3;
  console.log("✅ Usando D3 desde CDN (GitHub Pages)");
} else {
  try {
    d3$2 = {
      select,
      selectAll,
      zoom,
      zoomIdentity: identity,
      zoomTransform: transform,
      hierarchy,
      tree,
      easeCubicOut: cubicOut
    };
    console.log("✅ Usando D3 desde módulos ES6 (desarrollo)");
  } catch (error) {
    console.error("❌ Error cargando D3:", error);
    throw new Error("D3 no está disponible ni globalmente ni como módulo ES6");
  }
}
if (typeof window !== "undefined") {
  window.d3 = d3$2;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var papaparse_min = { exports: {} };
/* @license
Papa Parse
v5.5.3
https://github.com/mholt/PapaParse
License: MIT
*/
(function(module, exports) {
  ((e, t) => {
    module.exports = t();
  })(commonjsGlobal, function r() {
    var n = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== n ? n : {};
    var d, s = !n.document && !!n.postMessage, a = n.IS_PAPA_WORKER || false, o = {}, h = 0, v = {};
    function u(e) {
      this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, function(e2) {
        var t = b(e2);
        t.chunkSize = parseInt(t.chunkSize), e2.step || e2.chunk || (t.chunkSize = null);
        this._handle = new i(t), (this._handle.streamer = this)._config = t;
      }.call(this, e), this.parseChunk = function(t, e2) {
        var i2 = parseInt(this._config.skipFirstNLines) || 0;
        if (this.isFirstChunk && 0 < i2) {
          let e3 = this._config.newline;
          e3 || (r2 = this._config.quoteChar || '"', e3 = this._handle.guessLineEndings(t, r2)), t = [...t.split(e3).slice(i2)].join(e3);
        }
        this.isFirstChunk && U(this._config.beforeFirstChunk) && void 0 !== (r2 = this._config.beforeFirstChunk(t)) && (t = r2), this.isFirstChunk = false, this._halted = false;
        var i2 = this._partialLine + t, r2 = (this._partialLine = "", this._handle.parse(i2, this._baseIndex, !this._finished));
        if (!this._handle.paused() && !this._handle.aborted()) {
          t = r2.meta.cursor, i2 = (this._finished || (this._partialLine = i2.substring(t - this._baseIndex), this._baseIndex = t), r2 && r2.data && (this._rowCount += r2.data.length), this._finished || this._config.preview && this._rowCount >= this._config.preview);
          if (a)
            n.postMessage({ results: r2, workerId: v.WORKER_ID, finished: i2 });
          else if (U(this._config.chunk) && !e2) {
            if (this._config.chunk(r2, this._handle), this._handle.paused() || this._handle.aborted())
              return void (this._halted = true);
            this._completeResults = r2 = void 0;
          }
          return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(r2.data), this._completeResults.errors = this._completeResults.errors.concat(r2.errors), this._completeResults.meta = r2.meta), this._completed || !i2 || !U(this._config.complete) || r2 && r2.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), i2 || r2 && r2.meta.paused || this._nextChunk(), r2;
        }
        this._halted = true;
      }, this._sendError = function(e2) {
        U(this._config.error) ? this._config.error(e2) : a && this._config.error && n.postMessage({ workerId: v.WORKER_ID, error: e2, finished: false });
      };
    }
    function f(e) {
      var r2;
      (e = e || {}).chunkSize || (e.chunkSize = v.RemoteChunkSize), u.call(this, e), this._nextChunk = s ? function() {
        this._readChunk(), this._chunkLoaded();
      } : function() {
        this._readChunk();
      }, this.stream = function(e2) {
        this._input = e2, this._nextChunk();
      }, this._readChunk = function() {
        if (this._finished)
          this._chunkLoaded();
        else {
          if (r2 = new XMLHttpRequest(), this._config.withCredentials && (r2.withCredentials = this._config.withCredentials), s || (r2.onload = y(this._chunkLoaded, this), r2.onerror = y(this._chunkError, this)), r2.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !s), this._config.downloadRequestHeaders) {
            var e2, t = this._config.downloadRequestHeaders;
            for (e2 in t)
              r2.setRequestHeader(e2, t[e2]);
          }
          var i2;
          this._config.chunkSize && (i2 = this._start + this._config.chunkSize - 1, r2.setRequestHeader("Range", "bytes=" + this._start + "-" + i2));
          try {
            r2.send(this._config.downloadRequestBody);
          } catch (e3) {
            this._chunkError(e3.message);
          }
          s && 0 === r2.status && this._chunkError();
        }
      }, this._chunkLoaded = function() {
        4 === r2.readyState && (r2.status < 200 || 400 <= r2.status ? this._chunkError() : (this._start += this._config.chunkSize || r2.responseText.length, this._finished = !this._config.chunkSize || this._start >= ((e2) => null !== (e2 = e2.getResponseHeader("Content-Range")) ? parseInt(e2.substring(e2.lastIndexOf("/") + 1)) : -1)(r2), this.parseChunk(r2.responseText)));
      }, this._chunkError = function(e2) {
        e2 = r2.statusText || e2;
        this._sendError(new Error(e2));
      };
    }
    function l(e) {
      (e = e || {}).chunkSize || (e.chunkSize = v.LocalChunkSize), u.call(this, e);
      var i2, r2, n2 = "undefined" != typeof FileReader;
      this.stream = function(e2) {
        this._input = e2, r2 = e2.slice || e2.webkitSlice || e2.mozSlice, n2 ? ((i2 = new FileReader()).onload = y(this._chunkLoaded, this), i2.onerror = y(this._chunkError, this)) : i2 = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function() {
        this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
      }, this._readChunk = function() {
        var e2 = this._input, t = (this._config.chunkSize && (t = Math.min(this._start + this._config.chunkSize, this._input.size), e2 = r2.call(e2, this._start, t)), i2.readAsText(e2, this._config.encoding));
        n2 || this._chunkLoaded({ target: { result: t } });
      }, this._chunkLoaded = function(e2) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e2.target.result);
      }, this._chunkError = function() {
        this._sendError(i2.error);
      };
    }
    function c(e) {
      var i2;
      u.call(this, e = e || {}), this.stream = function(e2) {
        return i2 = e2, this._nextChunk();
      }, this._nextChunk = function() {
        var e2, t;
        if (!this._finished)
          return e2 = this._config.chunkSize, i2 = e2 ? (t = i2.substring(0, e2), i2.substring(e2)) : (t = i2, ""), this._finished = !i2, this.parseChunk(t);
      };
    }
    function p(e) {
      u.call(this, e = e || {});
      var t = [], i2 = true, r2 = false;
      this.pause = function() {
        u.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function() {
        u.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function(e2) {
        this._input = e2, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function() {
        r2 && 1 === t.length && (this._finished = true);
      }, this._nextChunk = function() {
        this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : i2 = true;
      }, this._streamData = y(function(e2) {
        try {
          t.push("string" == typeof e2 ? e2 : e2.toString(this._config.encoding)), i2 && (i2 = false, this._checkIsFinished(), this.parseChunk(t.shift()));
        } catch (e3) {
          this._streamError(e3);
        }
      }, this), this._streamError = y(function(e2) {
        this._streamCleanUp(), this._sendError(e2);
      }, this), this._streamEnd = y(function() {
        this._streamCleanUp(), r2 = true, this._streamData("");
      }, this), this._streamCleanUp = y(function() {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }
    function i(m2) {
      var n2, s2, a2, t, o2 = Math.pow(2, 53), h2 = -o2, u2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, d2 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, i2 = this, r2 = 0, f2 = 0, l2 = false, e = false, c2 = [], p2 = { data: [], errors: [], meta: {} };
      function y2(e2) {
        return "greedy" === m2.skipEmptyLines ? "" === e2.join("").trim() : 1 === e2.length && 0 === e2[0].length;
      }
      function g2() {
        if (p2 && a2 && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + v.DefaultDelimiter + "'"), a2 = false), m2.skipEmptyLines && (p2.data = p2.data.filter(function(e3) {
          return !y2(e3);
        })), _2()) {
          let t2 = function(e3, t3) {
            U(m2.transformHeader) && (e3 = m2.transformHeader(e3, t3)), c2.push(e3);
          };
          if (p2)
            if (Array.isArray(p2.data[0])) {
              for (var e2 = 0; _2() && e2 < p2.data.length; e2++)
                p2.data[e2].forEach(t2);
              p2.data.splice(0, 1);
            } else
              p2.data.forEach(t2);
        }
        function i3(e3, t2) {
          for (var i4 = m2.header ? {} : [], r4 = 0; r4 < e3.length; r4++) {
            var n3 = r4, s3 = e3[r4], s3 = ((e4, t3) => ((e5) => (m2.dynamicTypingFunction && void 0 === m2.dynamicTyping[e5] && (m2.dynamicTyping[e5] = m2.dynamicTypingFunction(e5)), true === (m2.dynamicTyping[e5] || m2.dynamicTyping)))(e4) ? "true" === t3 || "TRUE" === t3 || "false" !== t3 && "FALSE" !== t3 && (((e5) => {
              if (u2.test(e5)) {
                e5 = parseFloat(e5);
                if (h2 < e5 && e5 < o2)
                  return 1;
              }
            })(t3) ? parseFloat(t3) : d2.test(t3) ? new Date(t3) : "" === t3 ? null : t3) : t3)(n3 = m2.header ? r4 >= c2.length ? "__parsed_extra" : c2[r4] : n3, s3 = m2.transform ? m2.transform(s3, n3) : s3);
            "__parsed_extra" === n3 ? (i4[n3] = i4[n3] || [], i4[n3].push(s3)) : i4[n3] = s3;
          }
          return m2.header && (r4 > c2.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + c2.length + " fields but parsed " + r4, f2 + t2) : r4 < c2.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + c2.length + " fields but parsed " + r4, f2 + t2)), i4;
        }
        var r3;
        p2 && (m2.header || m2.dynamicTyping || m2.transform) && (r3 = 1, !p2.data.length || Array.isArray(p2.data[0]) ? (p2.data = p2.data.map(i3), r3 = p2.data.length) : p2.data = i3(p2.data, 0), m2.header && p2.meta && (p2.meta.fields = c2), f2 += r3);
      }
      function _2() {
        return m2.header && 0 === c2.length;
      }
      function k(e2, t2, i3, r3) {
        e2 = { type: e2, code: t2, message: i3 };
        void 0 !== r3 && (e2.row = r3), p2.errors.push(e2);
      }
      U(m2.step) && (t = m2.step, m2.step = function(e2) {
        p2 = e2, _2() ? g2() : (g2(), 0 !== p2.data.length && (r2 += e2.data.length, m2.preview && r2 > m2.preview ? s2.abort() : (p2.data = p2.data[0], t(p2, i2))));
      }), this.parse = function(e2, t2, i3) {
        var r3 = m2.quoteChar || '"', r3 = (m2.newline || (m2.newline = this.guessLineEndings(e2, r3)), a2 = false, m2.delimiter ? U(m2.delimiter) && (m2.delimiter = m2.delimiter(e2), p2.meta.delimiter = m2.delimiter) : ((r3 = ((e3, t3, i4, r4, n3) => {
          var s3, a3, o3, h3;
          n3 = n3 || [",", "	", "|", ";", v.RECORD_SEP, v.UNIT_SEP];
          for (var u3 = 0; u3 < n3.length; u3++) {
            for (var d4, f3 = n3[u3], l3 = 0, c3 = 0, p3 = 0, g3 = (o3 = void 0, new E({ comments: r4, delimiter: f3, newline: t3, preview: 10 }).parse(e3)), _3 = 0; _3 < g3.data.length; _3++)
              i4 && y2(g3.data[_3]) ? p3++ : (d4 = g3.data[_3].length, c3 += d4, void 0 === o3 ? o3 = d4 : 0 < d4 && (l3 += Math.abs(d4 - o3), o3 = d4));
            0 < g3.data.length && (c3 /= g3.data.length - p3), (void 0 === a3 || l3 <= a3) && (void 0 === h3 || h3 < c3) && 1.99 < c3 && (a3 = l3, s3 = f3, h3 = c3);
          }
          return { successful: !!(m2.delimiter = s3), bestDelimiter: s3 };
        })(e2, m2.newline, m2.skipEmptyLines, m2.comments, m2.delimitersToGuess)).successful ? m2.delimiter = r3.bestDelimiter : (a2 = true, m2.delimiter = v.DefaultDelimiter), p2.meta.delimiter = m2.delimiter), b(m2));
        return m2.preview && m2.header && r3.preview++, n2 = e2, s2 = new E(r3), p2 = s2.parse(n2, t2, i3), g2(), l2 ? { meta: { paused: true } } : p2 || { meta: { paused: false } };
      }, this.paused = function() {
        return l2;
      }, this.pause = function() {
        l2 = true, s2.abort(), n2 = U(m2.chunk) ? "" : n2.substring(s2.getCharIndex());
      }, this.resume = function() {
        i2.streamer._halted ? (l2 = false, i2.streamer.parseChunk(n2, true)) : setTimeout(i2.resume, 3);
      }, this.aborted = function() {
        return e;
      }, this.abort = function() {
        e = true, s2.abort(), p2.meta.aborted = true, U(m2.complete) && m2.complete(p2), n2 = "";
      }, this.guessLineEndings = function(e2, t2) {
        e2 = e2.substring(0, 1048576);
        var t2 = new RegExp(P(t2) + "([^]*?)" + P(t2), "gm"), i3 = (e2 = e2.replace(t2, "")).split("\r"), t2 = e2.split("\n"), e2 = 1 < t2.length && t2[0].length < i3[0].length;
        if (1 === i3.length || e2)
          return "\n";
        for (var r3 = 0, n3 = 0; n3 < i3.length; n3++)
          "\n" === i3[n3][0] && r3++;
        return r3 >= i3.length / 2 ? "\r\n" : "\r";
      };
    }
    function P(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function E(C) {
      var S = (C = C || {}).delimiter, O = C.newline, x = C.comments, I = C.step, A = C.preview, T = C.fastMode, D = null, L = false, F = null == C.quoteChar ? '"' : C.quoteChar, j = F;
      if (void 0 !== C.escapeChar && (j = C.escapeChar), ("string" != typeof S || -1 < v.BAD_DELIMITERS.indexOf(S)) && (S = ","), x === S)
        throw new Error("Comment character same as delimiter");
      true === x ? x = "#" : ("string" != typeof x || -1 < v.BAD_DELIMITERS.indexOf(x)) && (x = false), "\n" !== O && "\r" !== O && "\r\n" !== O && (O = "\n");
      var z = 0, M = false;
      this.parse = function(i2, t, r2) {
        if ("string" != typeof i2)
          throw new Error("Input must be a string");
        var n2 = i2.length, e = S.length, s2 = O.length, a2 = x.length, o2 = U(I), h2 = [], u2 = [], d2 = [], f2 = z = 0;
        if (!i2)
          return w();
        if (T || false !== T && -1 === i2.indexOf(F)) {
          for (var l2 = i2.split(O), c2 = 0; c2 < l2.length; c2++) {
            if (d2 = l2[c2], z += d2.length, c2 !== l2.length - 1)
              z += O.length;
            else if (r2)
              return w();
            if (!x || d2.substring(0, a2) !== x) {
              if (o2) {
                if (h2 = [], k(d2.split(S)), R(), M)
                  return w();
              } else
                k(d2.split(S));
              if (A && A <= c2)
                return h2 = h2.slice(0, A), w(true);
            }
          }
          return w();
        }
        for (var p2 = i2.indexOf(S, z), g2 = i2.indexOf(O, z), _2 = new RegExp(P(j) + P(F), "g"), m2 = i2.indexOf(F, z); ; )
          if (i2[z] === F)
            for (m2 = z, z++; ; ) {
              if (-1 === (m2 = i2.indexOf(F, m2 + 1)))
                return r2 || u2.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: h2.length, index: z }), E2();
              if (m2 === n2 - 1)
                return E2(i2.substring(z, m2).replace(_2, F));
              if (F === j && i2[m2 + 1] === j)
                m2++;
              else if (F === j || 0 === m2 || i2[m2 - 1] !== j) {
                -1 !== p2 && p2 < m2 + 1 && (p2 = i2.indexOf(S, m2 + 1));
                var y2 = v2(-1 === (g2 = -1 !== g2 && g2 < m2 + 1 ? i2.indexOf(O, m2 + 1) : g2) ? p2 : Math.min(p2, g2));
                if (i2.substr(m2 + 1 + y2, e) === S) {
                  d2.push(i2.substring(z, m2).replace(_2, F)), i2[z = m2 + 1 + y2 + e] !== F && (m2 = i2.indexOf(F, z)), p2 = i2.indexOf(S, z), g2 = i2.indexOf(O, z);
                  break;
                }
                y2 = v2(g2);
                if (i2.substring(m2 + 1 + y2, m2 + 1 + y2 + s2) === O) {
                  if (d2.push(i2.substring(z, m2).replace(_2, F)), b2(m2 + 1 + y2 + s2), p2 = i2.indexOf(S, z), m2 = i2.indexOf(F, z), o2 && (R(), M))
                    return w();
                  if (A && h2.length >= A)
                    return w(true);
                  break;
                }
                u2.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: h2.length, index: z }), m2++;
              }
            }
          else if (x && 0 === d2.length && i2.substring(z, z + a2) === x) {
            if (-1 === g2)
              return w();
            z = g2 + s2, g2 = i2.indexOf(O, z), p2 = i2.indexOf(S, z);
          } else if (-1 !== p2 && (p2 < g2 || -1 === g2))
            d2.push(i2.substring(z, p2)), z = p2 + e, p2 = i2.indexOf(S, z);
          else {
            if (-1 === g2)
              break;
            if (d2.push(i2.substring(z, g2)), b2(g2 + s2), o2 && (R(), M))
              return w();
            if (A && h2.length >= A)
              return w(true);
          }
        return E2();
        function k(e2) {
          h2.push(e2), f2 = z;
        }
        function v2(e2) {
          var t2 = 0;
          return t2 = -1 !== e2 && (e2 = i2.substring(m2 + 1, e2)) && "" === e2.trim() ? e2.length : t2;
        }
        function E2(e2) {
          return r2 || (void 0 === e2 && (e2 = i2.substring(z)), d2.push(e2), z = n2, k(d2), o2 && R()), w();
        }
        function b2(e2) {
          z = e2, k(d2), d2 = [], g2 = i2.indexOf(O, z);
        }
        function w(e2) {
          if (C.header && !t && h2.length && !L) {
            var s3 = h2[0], a3 = /* @__PURE__ */ Object.create(null), o3 = new Set(s3);
            let n3 = false;
            for (let r3 = 0; r3 < s3.length; r3++) {
              let i3 = s3[r3];
              if (a3[i3 = U(C.transformHeader) ? C.transformHeader(i3, r3) : i3]) {
                let e3, t2 = a3[i3];
                for (; e3 = i3 + "_" + t2, t2++, o3.has(e3); )
                  ;
                o3.add(e3), s3[r3] = e3, a3[i3]++, n3 = true, (D = null === D ? {} : D)[e3] = i3;
              } else
                a3[i3] = 1, s3[r3] = i3;
              o3.add(i3);
            }
            n3 && console.warn("Duplicate headers found and renamed."), L = true;
          }
          return { data: h2, errors: u2, meta: { delimiter: S, linebreak: O, aborted: M, truncated: !!e2, cursor: f2 + (t || 0), renamedHeaders: D } };
        }
        function R() {
          I(w()), h2 = [], u2 = [];
        }
      }, this.abort = function() {
        M = true;
      }, this.getCharIndex = function() {
        return z;
      };
    }
    function g(e) {
      var t = e.data, i2 = o[t.workerId], r2 = false;
      if (t.error)
        i2.userError(t.error, t.file);
      else if (t.results && t.results.data) {
        var n2 = { abort: function() {
          r2 = true, _(t.workerId, { data: [], errors: [], meta: { aborted: true } });
        }, pause: m, resume: m };
        if (U(i2.userStep)) {
          for (var s2 = 0; s2 < t.results.data.length && (i2.userStep({ data: t.results.data[s2], errors: t.results.errors, meta: t.results.meta }, n2), !r2); s2++)
            ;
          delete t.results;
        } else
          U(i2.userChunk) && (i2.userChunk(t.results, n2, t.file), delete t.results);
      }
      t.finished && !r2 && _(t.workerId, t.results);
    }
    function _(e, t) {
      var i2 = o[e];
      U(i2.userComplete) && i2.userComplete(t), i2.terminate(), delete o[e];
    }
    function m() {
      throw new Error("Not implemented.");
    }
    function b(e) {
      if ("object" != typeof e || null === e)
        return e;
      var t, i2 = Array.isArray(e) ? [] : {};
      for (t in e)
        i2[t] = b(e[t]);
      return i2;
    }
    function y(e, t) {
      return function() {
        e.apply(t, arguments);
      };
    }
    function U(e) {
      return "function" == typeof e;
    }
    return v.parse = function(e, t) {
      var i2 = (t = t || {}).dynamicTyping || false;
      U(i2) && (t.dynamicTypingFunction = i2, i2 = {});
      if (t.dynamicTyping = i2, t.transform = !!U(t.transform) && t.transform, !t.worker || !v.WORKERS_SUPPORTED)
        return i2 = null, v.NODE_STREAM_INPUT, "string" == typeof e ? (e = ((e2) => 65279 !== e2.charCodeAt(0) ? e2 : e2.slice(1))(e), i2 = new (t.download ? f : c)(t)) : true === e.readable && U(e.read) && U(e.on) ? i2 = new p(t) : (n.File && e instanceof File || e instanceof Object) && (i2 = new l(t)), i2.stream(e);
      (i2 = (() => {
        var e2;
        return !!v.WORKERS_SUPPORTED && (e2 = (() => {
          var e3 = n.URL || n.webkitURL || null, t2 = r.toString();
          return v.BLOB_URL || (v.BLOB_URL = e3.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", t2, ")();"], { type: "text/javascript" })));
        })(), (e2 = new n.Worker(e2)).onmessage = g, e2.id = h++, o[e2.id] = e2);
      })()).userStep = t.step, i2.userChunk = t.chunk, i2.userComplete = t.complete, i2.userError = t.error, t.step = U(t.step), t.chunk = U(t.chunk), t.complete = U(t.complete), t.error = U(t.error), delete t.worker, i2.postMessage({ input: e, config: t, workerId: i2.id });
    }, v.unparse = function(e, t) {
      var n2 = false, _2 = true, m2 = ",", y2 = "\r\n", s2 = '"', a2 = s2 + s2, i2 = false, r2 = null, o2 = false, h2 = ((() => {
        if ("object" == typeof t) {
          if ("string" != typeof t.delimiter || v.BAD_DELIMITERS.filter(function(e2) {
            return -1 !== t.delimiter.indexOf(e2);
          }).length || (m2 = t.delimiter), "boolean" != typeof t.quotes && "function" != typeof t.quotes && !Array.isArray(t.quotes) || (n2 = t.quotes), "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (i2 = t.skipEmptyLines), "string" == typeof t.newline && (y2 = t.newline), "string" == typeof t.quoteChar && (s2 = t.quoteChar), "boolean" == typeof t.header && (_2 = t.header), Array.isArray(t.columns)) {
            if (0 === t.columns.length)
              throw new Error("Option columns is empty");
            r2 = t.columns;
          }
          void 0 !== t.escapeChar && (a2 = t.escapeChar + s2), t.escapeFormulae instanceof RegExp ? o2 = t.escapeFormulae : "boolean" == typeof t.escapeFormulae && t.escapeFormulae && (o2 = /^[=+\-@\t\r].*$/);
        }
      })(), new RegExp(P(s2), "g"));
      "string" == typeof e && (e = JSON.parse(e));
      if (Array.isArray(e)) {
        if (!e.length || Array.isArray(e[0]))
          return u2(null, e, i2);
        if ("object" == typeof e[0])
          return u2(r2 || Object.keys(e[0]), e, i2);
      } else if ("object" == typeof e)
        return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || r2), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), u2(e.fields || [], e.data || [], i2);
      throw new Error("Unable to serialize unrecognized input");
      function u2(e2, t2, i3) {
        var r3 = "", n3 = ("string" == typeof e2 && (e2 = JSON.parse(e2)), "string" == typeof t2 && (t2 = JSON.parse(t2)), Array.isArray(e2) && 0 < e2.length), s3 = !Array.isArray(t2[0]);
        if (n3 && _2) {
          for (var a3 = 0; a3 < e2.length; a3++)
            0 < a3 && (r3 += m2), r3 += k(e2[a3], a3);
          0 < t2.length && (r3 += y2);
        }
        for (var o3 = 0; o3 < t2.length; o3++) {
          var h3 = (n3 ? e2 : t2[o3]).length, u3 = false, d2 = n3 ? 0 === Object.keys(t2[o3]).length : 0 === t2[o3].length;
          if (i3 && !n3 && (u3 = "greedy" === i3 ? "" === t2[o3].join("").trim() : 1 === t2[o3].length && 0 === t2[o3][0].length), "greedy" === i3 && n3) {
            for (var f2 = [], l2 = 0; l2 < h3; l2++) {
              var c2 = s3 ? e2[l2] : l2;
              f2.push(t2[o3][c2]);
            }
            u3 = "" === f2.join("").trim();
          }
          if (!u3) {
            for (var p2 = 0; p2 < h3; p2++) {
              0 < p2 && !d2 && (r3 += m2);
              var g2 = n3 && s3 ? e2[p2] : p2;
              r3 += k(t2[o3][g2], p2);
            }
            o3 < t2.length - 1 && (!i3 || 0 < h3 && !d2) && (r3 += y2);
          }
        }
        return r3;
      }
      function k(e2, t2) {
        var i3, r3;
        return null == e2 ? "" : e2.constructor === Date ? JSON.stringify(e2).slice(1, 25) : (r3 = false, o2 && "string" == typeof e2 && o2.test(e2) && (e2 = "'" + e2, r3 = true), i3 = e2.toString().replace(h2, a2), (r3 = r3 || true === n2 || "function" == typeof n2 && n2(e2, t2) || Array.isArray(n2) && n2[t2] || ((e3, t3) => {
          for (var i4 = 0; i4 < t3.length; i4++)
            if (-1 < e3.indexOf(t3[i4]))
              return true;
          return false;
        })(i3, v.BAD_DELIMITERS) || -1 < i3.indexOf(m2) || " " === i3.charAt(0) || " " === i3.charAt(i3.length - 1)) ? s2 + i3 + s2 : i3);
      }
    }, v.RECORD_SEP = String.fromCharCode(30), v.UNIT_SEP = String.fromCharCode(31), v.BYTE_ORDER_MARK = "\uFEFF", v.BAD_DELIMITERS = ["\r", "\n", '"', v.BYTE_ORDER_MARK], v.WORKERS_SUPPORTED = !s && !!n.Worker, v.NODE_STREAM_INPUT = 1, v.LocalChunkSize = 10485760, v.RemoteChunkSize = 5242880, v.DefaultDelimiter = ",", v.Parser = E, v.ParserHandle = i, v.NetworkStreamer = f, v.FileStreamer = l, v.StringStreamer = c, v.ReadableStreamStreamer = p, n.jQuery && ((d = n.jQuery).fn.parse = function(o2) {
      var i2 = o2.config || {}, h2 = [];
      return this.each(function(e2) {
        if (!("INPUT" === d(this).prop("tagName").toUpperCase() && "file" === d(this).attr("type").toLowerCase() && n.FileReader) || !this.files || 0 === this.files.length)
          return true;
        for (var t = 0; t < this.files.length; t++)
          h2.push({ file: this.files[t], inputElem: this, instanceConfig: d.extend({}, i2) });
      }), e(), this;
      function e() {
        if (0 === h2.length)
          U(o2.complete) && o2.complete();
        else {
          var e2, t, i3, r2, n2 = h2[0];
          if (U(o2.before)) {
            var s2 = o2.before(n2.file, n2.inputElem);
            if ("object" == typeof s2) {
              if ("abort" === s2.action)
                return e2 = "AbortError", t = n2.file, i3 = n2.inputElem, r2 = s2.reason, void (U(o2.error) && o2.error({ name: e2 }, t, i3, r2));
              if ("skip" === s2.action)
                return void u2();
              "object" == typeof s2.config && (n2.instanceConfig = d.extend(n2.instanceConfig, s2.config));
            } else if ("skip" === s2)
              return void u2();
          }
          var a2 = n2.instanceConfig.complete;
          n2.instanceConfig.complete = function(e3) {
            U(a2) && a2(e3, n2.file, n2.inputElem), u2();
          }, v.parse(n2.file, n2.instanceConfig);
        }
      }
      function u2() {
        h2.splice(0, 1), e();
      }
    }), a && (n.onmessage = function(e) {
      e = e.data;
      void 0 === v.WORKER_ID && e && (v.WORKER_ID = e.workerId);
      "string" == typeof e.input ? n.postMessage({ workerId: v.WORKER_ID, results: v.parse(e.input, e.config), finished: true }) : (n.File && e.input instanceof File || e.input instanceof Object) && (e = v.parse(e.input, e.config)) && n.postMessage({ workerId: v.WORKER_ID, results: e, finished: true });
    }), (f.prototype = Object.create(u.prototype)).constructor = f, (l.prototype = Object.create(u.prototype)).constructor = l, (c.prototype = Object.create(c.prototype)).constructor = c, (p.prototype = Object.create(u.prototype)).constructor = p, v;
  });
})(papaparse_min);
var papaparse_minExports = papaparse_min.exports;
const Papa$1 = /* @__PURE__ */ getDefaultExportFromCjs(papaparse_minExports);
let PapaInstance;
if (typeof window !== "undefined" && window.Papa) {
  PapaInstance = window.Papa;
  console.log("✅ Usando PapaParse desde CDN (GitHub Pages)");
} else {
  try {
    PapaInstance = Papa$1;
    console.log("✅ Usando PapaParse desde módulos ES6 (desarrollo)");
  } catch (error) {
    console.error("❌ Error cargando PapaParse:", error);
    throw new Error("PapaParse no está disponible ni globalmente ni como módulo ES6");
  }
}
if (typeof window !== "undefined") {
  window.Papa = PapaInstance;
}
class XDiagramsSourceDetector {
  constructor() {
    this.sourcePatterns = {
      googleSheets: [
        "google.com/spreadsheets",
        "docs.google.com"
      ],
      restApi: [
        "api.",
        "/api/"
      ],
      csvUrl: [
        ".csv",
        "output=csv"
      ],
      jsonUrl: [
        ".json"
      ],
      protectedApi: [
        "sheet.best",
        "sheetbest.com"
      ]
    };
  }
  /**
   * Detecta el tipo de fuente de datos
   * @param {string|Array|Object} source - La fuente de datos
   * @returns {string} El tipo de fuente detectado
   */
  detectSourceType(source) {
    console.log(`🔍 [SourceDetector] detectSourceType llamado con:`, source);
    console.log(`🔍 [SourceDetector] Tipo de source:`, typeof source);
    if (typeof source === "string") {
      const result = this.detectStringSource(source);
      console.log(`🔍 [SourceDetector] Resultado para string: ${result}`);
      return result;
    }
    if (Array.isArray(source)) {
      return "multiple-urls";
    }
    if (typeof source === "object" && source !== null) {
      return this.detectObjectSource(source);
    }
    return "unknown";
  }
  /**
   * Detecta el tipo de fuente cuando es un string (URL)
   * @param {string} source - La URL o string fuente
   * @returns {string} El tipo de fuente detectado
   */
  detectStringSource(source) {
    const url = source.toLowerCase();
    console.log(`🔍 [SourceDetector] Analizando URL: ${source}`);
    console.log(`🔍 [SourceDetector] URL en minúsculas: ${url}`);
    console.log(`🔍 [SourceDetector] Patrones protegidos:`, this.sourcePatterns.protectedApi);
    if (this.sourcePatterns.protectedApi.some((pattern) => url.includes(pattern))) {
      console.log(`✅ [SourceDetector] Detectada como API protegida`);
      return "protected-api";
    }
    if (this.sourcePatterns.googleSheets.some((pattern) => url.includes(pattern))) {
      return "google-sheets";
    }
    if (url.endsWith(".json") || url.includes(".json?")) {
      return "json-url";
    }
    if (this.sourcePatterns.csvUrl.some((pattern) => url.includes(pattern))) {
      return "csv-url";
    }
    if (this.sourcePatterns.restApi.some((pattern) => url.includes(pattern))) {
      return "rest-api";
    }
    return "unknown";
  }
  /**
   * Detecta el tipo de fuente cuando es un objeto
   * @param {Object} source - El objeto fuente
   * @returns {string} El tipo de fuente detectado
   */
  detectObjectSource(source) {
    if (source.urls && Array.isArray(source.urls)) {
      return "multiple-urls";
    }
    if (source.data || source.records) {
      return "object";
    }
    return "unknown";
  }
  /**
   * Valida si una URL es válida
   * @param {string} url - La URL a validar
   * @returns {boolean} True si la URL es válida
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    const urlLower = url.toLowerCase();
    return this.sourcePatterns.protectedApi.some((pattern) => urlLower.includes(pattern));
  }
  /**
   * Obtiene información de autenticación para una URL
   * @param {string} url - La URL a analizar
   * @returns {Object} Información de autenticación
   */
  getAuthInfo(url) {
    const requiresAuth = this.requiresAuthentication(url);
    return {
      requiresAuth,
      hasApiKey: requiresAuth,
      // Ahora manejado por Netlify Functions
      configuredPatterns: this.sourcePatterns.protectedApi
    };
  }
  /**
   * Normaliza una URL de Google Sheets para CSV
   * @param {string} url - La URL original de Google Sheets
   * @returns {string} La URL convertida para CSV
   */
  convertGoogleSheetsToCsv(url) {
    if (url.includes("output=csv")) {
      return url;
    }
    if (url.includes("/edit")) {
      return url.replace("/edit", "/pub?output=csv");
    }
    if (url.includes("/pub")) {
      if (url.includes("?")) {
        return `${url}&output=csv`;
      }
      return `${url}?output=csv`;
    }
    return `${url}?output=csv`;
  }
}
class XDiagramsAuthManager {
  constructor() {
    this.authMethods = {
      "sheet.best": this.createSheetBestAuth,
      "sheetbest.com": this.createSheetBestAuth,
      "default": this.createDefaultAuth
    };
  }
  /**
   * Crea headers de autenticación para SheetBest
   * @param {string} apiKey - La API Key
   * @returns {Object} Headers de autenticación
   */
  createSheetBestAuth(apiKey) {
    return {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json"
    };
  }
  /**
   * Crea headers de autenticación por defecto
   * @param {string} apiKey - La API Key
   * @returns {Object} Headers de autenticación
   */
  createDefaultAuth(apiKey) {
    return {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
  }
  /**
   * Obtiene los headers de autenticación para una URL
   * @param {string} url - La URL para la cual obtener headers
   * @returns {Object|null} Headers de autenticación o null si no requiere autenticación
   */
  getAuthHeaders(url) {
    return null;
  }
  /**
   * Verifica si una URL requiere autenticación
   * @param {string} url - La URL a verificar
   * @returns {boolean} True si requiere autenticación
   */
  requiresAuthentication(url) {
    if (!url)
      return false;
    const urlLower = url.toLowerCase();
    return urlLower.includes("sheet.best") || urlLower.includes("sheetbest.com");
  }
  /**
   * Agrega un método de autenticación personalizado
   * @param {string} pattern - Patrón de hostname
   * @param {Function} authMethod - Función que crea headers de autenticación
   */
  addAuthMethod(pattern, authMethod) {
    this.authMethods[pattern] = authMethod;
  }
  /**
   * Obtiene información de autenticación para debugging
   * @param {string} url - La URL a analizar
   * @returns {Object} Información de autenticación
   */
  getAuthInfo(url) {
    const requiresAuth = this.requiresAuthentication(url);
    return {
      url,
      requiresAuthentication: requiresAuth,
      hasApiKey: requiresAuth,
      // Ahora manejado por Netlify Functions
      configuredPatterns: ["sheet.best", "sheetbest.com"],
      authMethod: requiresAuth ? this.getAuthMethodName(url) : null
    };
  }
  /**
   * Obtiene el nombre del método de autenticación para una URL
   * @param {string} url - La URL
   * @returns {string} Nombre del método de autenticación
   */
  getAuthMethodName(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      for (const [pattern, method] of Object.entries(this.authMethods)) {
        if (hostname.includes(pattern)) {
          return pattern;
        }
      }
      return "default";
    } catch (error) {
      return "unknown";
    }
  }
  /**
   * Valida si una API Key es válida (formato básico)
   * @param {string} apiKey - La API Key a validar
   * @returns {boolean} True si el formato parece válido
   */
  validateApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      return false;
    }
    return apiKey.trim().length >= 10;
  }
  /**
   * Maneja errores de autenticación
   * @param {Response} response - Respuesta del fetch
   * @param {string} url - URL que causó el error
   * @returns {Error} Error con información específica de autenticación
   */
  handleAuthError(response, url) {
    let errorMessage = "Error de autenticación";
    switch (response.status) {
      case 401:
        errorMessage = "API Key inválida o expirada. Verifica tu configuración.";
        break;
      case 403:
        errorMessage = "Acceso denegado. Verifica que tu API Key tenga los permisos necesarios.";
        break;
      case 429:
        errorMessage = "Límite de requests excedido. Intenta más tarde.";
        break;
      default:
        errorMessage = `Error de autenticación: ${response.status} ${response.statusText}`;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.url = url;
    error.isAuthError = true;
    return error;
  }
}
class XDiagramsDataLoader {
  constructor() {
    this.sourceDetector = new XDiagramsSourceDetector();
    this.authManager = new XDiagramsAuthManager();
  }
  /**
   * Carga datos desde Google Sheets
   * @param {string} url - URL del Google Sheet
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromGoogleSheets(url, options = {}) {
    try {
      const csvUrl = this.sourceDetector.convertGoogleSheetsToCsv(url);
      const timeout2 = options.timeout || 1e4;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout2);
      const response = await fetch(csvUrl, {
        signal: controller.signal,
        mode: "cors"
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      const csvText = await response.text();
      if (!csvText || csvText.trim() === "") {
        throw new Error("El archivo de Google Sheets está vacío o no contiene datos válidos");
      }
      return this.parseCsv(csvText, options);
    } catch (error) {
      console.error("Error loading from Google Sheets:", error);
      if (error.name === "AbortError") {
        throw new Error(`Timeout: No se pudo cargar el archivo de Google Sheets después de ${timeout}ms. Verifica la URL y tu conexión a internet.`);
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_CLOSED")) {
        throw new Error("Error de conexión: No se pudo conectar con Google Sheets. Verifica tu conexión a internet y que la URL sea correcta.");
      }
      if (error.message.includes("CORS")) {
        throw new Error("Error de CORS: El archivo de Google Sheets no permite acceso desde este dominio. Verifica la configuración de permisos.");
      }
      throw new Error(`Error cargando Google Sheets: ${error.message}`);
    }
  }
  /**
   * Carga datos desde una API REST
   * @param {string} url - URL de la API
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromRestApi(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      }
    };
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const jsonData = await response.json();
    return this.convertJsonToCsvFormat(jsonData, options);
  }
  /**
   * Carga datos desde una URL CSV
   * @param {string} url - URL del archivo CSV
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromCsvUrl(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        "Content-Type": "text/csv",
        ...authHeaders
      }
    };
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const csvText = await response.text();
    return this.parseCsv(csvText, options);
  }
  /**
   * Carga datos desde una URL JSON
   * @param {string} url - URL del archivo JSON
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromJsonUrl(url, options = {}) {
    const authHeaders = this.authManager.getAuthHeaders(url);
    const fetchOptions = {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      }
    };
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw this.authManager.handleAuthError(response, url);
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const jsonData = await response.json();
    return this.convertJsonToCsvFormat(jsonData, options);
  }
  /**
   * Carga datos desde una API protegida (como SheetBest)
   * @param {string} url - URL de la API protegida
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos cargados
   */
  async loadFromProtectedApi(url, options = {}) {
    try {
      console.log(`🔐 [DataLoader] Cargando desde API protegida via Netlify Function: ${url}`);
      const proxyUrl = `/api/sheetbest-proxy?url=${encodeURIComponent(url)}`;
      console.log(`🌐 [DataLoader] Proxy URL: ${proxyUrl}`);
      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(`📡 [DataLoader] Response status: ${response.status}`);
      console.log(`📡 [DataLoader] Response headers:`, Object.fromEntries(response.headers.entries()));
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ [DataLoader] Datos cargados exitosamente desde proxy`);
      if (Array.isArray(data)) {
        return data;
      } else {
        return this.convertJsonToCsvFormat(data, options);
      }
    } catch (error) {
      console.error(`❌ [DataLoader] Error cargando desde API protegida:`, error);
      throw new Error(`Error cargando API protegida: ${error.message}`);
    }
  }
  /**
   * Carga datos desde un objeto
   * @param {Object} dataObject - Objeto con datos
   * @returns {Array} Datos extraídos
   */
  loadFromObject(dataObject) {
    if (Array.isArray(dataObject)) {
      return dataObject;
    }
    if (dataObject.data) {
      return Array.isArray(dataObject.data) ? dataObject.data : [dataObject.data];
    }
    if (dataObject.records) {
      return Array.isArray(dataObject.records) ? dataObject.records : [dataObject.records];
    }
    return [dataObject];
  }
  /**
   * Carga datos desde múltiples URLs
   * @param {Object} config - Configuración con URLs
   * @param {Object} options - Opciones de carga
   * @returns {Promise<Array>} Datos combinados
   */
  async loadFromMultipleUrls(config, options = {}) {
    const urls = Array.isArray(config) ? config : config.urls;
    const combineStrategy = config.combineStrategy || "append";
    let allData = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        const data = await this.loadData(url, (data2) => data2, options);
        if (data && Array.isArray(data)) {
          const enrichedData = data.map((item) => ({
            ...item,
            _source: url,
            _sourceIndex: i
          }));
          if (combineStrategy === "merge") {
            allData = this.mergeData(allData, enrichedData);
          } else {
            allData = allData.concat(enrichedData);
          }
        }
      } catch (error) {
        console.warn(`Error cargando URL ${url}:`, error);
      }
    }
    return allData;
  }
  /**
   * Combina datos existentes con nuevos datos
   * @param {Array} existingData - Datos existentes
   * @param {Array} newData - Nuevos datos
   * @returns {Array} Datos combinados
   */
  mergeData(existingData, newData) {
    const merged = [...existingData];
    newData.forEach((newItem) => {
      const existingIndex = merged.findIndex(
        (existing) => existing.id === newItem.id || existing.ID === newItem.ID || existing.node === newItem.node || existing.Node === newItem.Node
      );
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...newItem };
      } else {
        merged.push(newItem);
      }
    });
    return merged;
  }
  /**
   * Parsea texto CSV a array de objetos
   * @param {string} csvText - Texto CSV
   * @param {Object} options - Opciones de parsing
   * @returns {Promise<Array>} Datos parseados
   */
  parseCsv(csvText, options = {}) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        ...options,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn("Errores en parsing CSV:", results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  /**
   * Convierte datos JSON al formato CSV esperado
   * @param {*} jsonData - Datos JSON
   * @param {Object} options - Opciones de conversión
   * @returns {Array} Datos en formato CSV
   */
  convertJsonToCsvFormat(jsonData, options = {}) {
    if (Array.isArray(jsonData)) {
      return jsonData;
    }
    if (jsonData.data && Array.isArray(jsonData.data)) {
      return jsonData.data;
    }
    if (jsonData.records && Array.isArray(jsonData.records)) {
      return jsonData.records;
    }
    if (jsonData.items && Array.isArray(jsonData.items)) {
      return jsonData.items;
    }
    if (typeof jsonData === "object" && jsonData !== null) {
      return [jsonData];
    }
    if (typeof jsonData === "string") {
      try {
        const parsed = JSON.parse(jsonData);
        return this.convertJsonToCsvFormat(parsed, options);
      } catch (error) {
        throw new Error("Datos JSON inválidos");
      }
    }
    throw new Error("Formato de datos no reconocido");
  }
  /**
   * Carga datos desde cualquier fuente
   * @param {*} source - Fuente de datos
   * @param {Function} onComplete - Callback de completado
   * @param {Object} options - Opciones de carga
   */
  async loadData(source, onComplete, options = {}) {
    let sourceType;
    try {
      sourceType = this.sourceDetector.detectSourceType(source);
      let data;
      switch (sourceType) {
        case "protected-api":
          data = await this.loadFromProtectedApi(source, options);
          break;
        case "google-sheets":
          data = await this.loadFromGoogleSheets(source, options);
          break;
        case "rest-api":
          data = await this.loadFromRestApi(source, options);
          break;
        case "csv-url":
          data = await this.loadFromCsvUrl(source, options);
          break;
        case "json-url":
          data = await this.loadFromJsonUrl(source, options);
          break;
        case "object":
          data = this.loadFromObject(source);
          break;
        case "multiple-urls":
          data = await this.loadFromMultipleUrls(source, options);
          break;
        case "unknown":
          throw new Error(`No se pudo determinar el tipo de fuente. URL o formato no reconocido: ${source}`);
        default:
          throw new Error(`Tipo de fuente no soportado: ${sourceType}`);
      }
      onComplete(data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      let errorMessage = error.message;
      if (error.isAuthError) {
        errorMessage = `Error de autenticación: ${error.message}

Sugerencias:
- Verifica que tu API Key esté configurada correctamente
- Asegúrate de que la API Key tenga los permisos necesarios
- Verifica que la URL sea correcta
- Revisa la documentación de la API para más detalles`;
      } else if (sourceType === "protected-api") {
        errorMessage = `Error cargando API protegida: ${error.message}

Sugerencias:
- Verifica que tu API Key esté configurada
- Asegúrate de que la URL sea correcta
- Verifica los permisos de tu API Key
- Revisa la documentación de la API`;
      } else if (sourceType === "google-sheets") {
        errorMessage = `Error cargando Google Sheets: ${error.message}

Sugerencias:
- Verifica que la URL sea correcta
- Asegúrate de que el archivo esté publicado públicamente
- Verifica tu conexión a internet
- Intenta usar un archivo CSV local como alternativa`;
      } else if (sourceType === "csv-url") {
        errorMessage = `Error cargando archivo CSV: ${error.message}

Sugerencias:
- Verifica que la URL sea correcta
- Asegúrate de que el archivo sea accesible
- Verifica tu conexión a internet`;
      }
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.sourceType = sourceType;
      enhancedError.source = source;
      onComplete(null, enhancedError);
    }
  }
}
class XDiagramsCache {
  constructor() {
    this.config = {
      ttl: 36e5,
      // 1 hora por defecto
      maxSize: 10,
      // 10MB
      version: "1.0"
    };
    this.isLoading = false;
    this.currentUrl = null;
  }
  getCacheKey(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `xdiagrams_cache_${Math.abs(hash)}`;
  }
  shouldCache(url) {
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin === window.location.origin)
        return false;
      return url.includes("api.") || url.includes(".json") || url.includes("/api/");
    } catch {
      return false;
    }
  }
  get(url) {
    if (!this.shouldCache(url))
      return null;
    try {
      const key = this.getCacheKey(url);
      const cached = localStorage.getItem(key);
      if (!cached)
        return null;
      const data = JSON.parse(cached);
      if (data.expires && Date.now() > data.expires) {
        localStorage.removeItem(key);
        return null;
      }
      if (data.version !== this.config.version) {
        localStorage.removeItem(key);
        return null;
      }
      return data.data;
    } catch (error) {
      console.warn("Error reading cache:", error);
      return null;
    }
  }
  set(url, data) {
    if (!this.shouldCache(url))
      return;
    try {
      const key = this.getCacheKey(url);
      const cacheData = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.config.ttl,
        version: this.config.version,
        url
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Error saving to cache:", error);
    }
  }
  clear(url) {
    try {
      const key = this.getCacheKey(url);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Error clearing cache:", error);
    }
  }
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith("xdiagrams_cache_"));
      cacheKeys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Error clearing all cache:", error);
    }
  }
  // Métodos de gestión de estado de carga
  /**
   * Inicia el estado de carga
   * @param {string} url - URL que se está cargando
   */
  startLoading(url) {
    this.isLoading = true;
    this.currentUrl = typeof url === "string" ? url : null;
  }
  /**
   * Finaliza el estado de carga
   */
  stopLoading() {
    this.isLoading = false;
  }
  /**
   * Obtiene el estado de carga actual
   * @returns {Object} Estado de carga
   */
  getLoadingState() {
    return {
      isLoading: this.isLoading,
      currentUrl: this.currentUrl
    };
  }
}
class XDiagramsLoader {
  constructor() {
    this.dataLoader = new XDiagramsDataLoader();
    this.cache = new XDiagramsCache();
  }
  /**
   * Carga datos desde cualquier fuente
   * @param {*} source - Fuente de datos
   * @param {Function} onComplete - Callback de completado
   * @param {Object} options - Opciones de carga
   */
  async loadData(source, onComplete, options = {}) {
    this.cache.startLoading(source);
    try {
      const cachedData = this.cache.get(source);
      if (cachedData) {
        this.cache.stopLoading();
        onComplete(cachedData);
        return;
      }
      await this.dataLoader.loadData(source, (data, error) => {
        this.cache.stopLoading();
        if (error) {
          onComplete(null, error);
          return;
        }
        this.cache.set(source, data);
        onComplete(data);
      }, options);
    } catch (error) {
      this.cache.stopLoading();
      onComplete(null, error);
    }
  }
  /**
   * Limpia el cache
   * @param {string} url - URL específica a limpiar (opcional)
   */
  clearCache(url) {
    this.cache.clear(url);
  }
  /**
   * Obtiene el estado de carga actual
   * @returns {Object} Estado de carga
   */
  getLoadingState() {
    return this.cache.getLoadingState();
  }
  // Acceso directo a los submódulos para casos específicos
  get dataLoaderInstance() {
    return this.dataLoader;
  }
  get cacheInstance() {
    return this.cache;
  }
}
class XDiagramsIconManager {
  constructor(config = {}) {
    this.config = {
      defaultIcon: "detail",
      ...config
    };
    this.validCustomIcons = [
      "detail",
      "list",
      "grid",
      "form",
      "document",
      "modal",
      "report",
      "profile",
      "home",
      "settings"
    ];
    this.iconUnicodeMap = {
      "detail": "",
      "list": "",
      "grid": "",
      "form": "",
      "document": "",
      "modal": "",
      "report": "",
      "profile": "",
      "home": "",
      "settings": ""
    };
    this.iconAliases = {
      "icon": "detail",
      "default": "detail"
    };
  }
  // Validar si un icono personalizado es válido
  isValidCustomIcon(iconName) {
    if (!iconName || typeof iconName !== "string") {
      return false;
    }
    const normalizedName = this.normalizeIconName(iconName);
    return this.validCustomIcons.includes(normalizedName);
  }
  // Obtener código Unicode de un icono
  getIconUnicode(iconName) {
    if (!iconName || typeof iconName !== "string") {
      return this.iconUnicodeMap["detail"];
    }
    const normalizedName = this.normalizeIconName(iconName);
    return this.iconUnicodeMap[normalizedName] || this.iconUnicodeMap["detail"];
  }
  // Normalizar nombre de icono (convertir a minúsculas y reemplazar espacios con guiones)
  normalizeIconName(iconName) {
    if (!iconName || typeof iconName !== "string")
      return "";
    let normalized = iconName.toLowerCase().trim();
    if (this.iconAliases[normalized]) {
      return this.iconAliases[normalized];
    }
    normalized = normalized.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return normalized;
  }
  // Verificar si es una URL de imagen externa
  isExternalImageUrl(url) {
    if (!url || typeof url !== "string")
      return false;
    try {
      const urlObj = new URL(url);
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp"];
      const hasImageExtension = imageExtensions.some(
        (ext) => urlObj.pathname.toLowerCase().endsWith(ext)
      );
      const imageIndicators = ["image", "img", "photo", "pic", "avatar"];
      const hasImageIndicator = imageIndicators.some(
        (indicator) => urlObj.pathname.toLowerCase().includes(indicator)
      );
      return hasImageExtension || hasImageIndicator;
    } catch (e) {
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp"];
      return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    }
  }
  // Verificar si los iconos personalizados están cargados
  isCustomIconsLoaded() {
    const testElement = document.createElement("span");
    testElement.style.cssText = "position: absolute; visibility: hidden; font-size: 24px; font-family: xdiagrams-icons;";
    testElement.textContent = "";
    document.body.appendChild(testElement);
    const beforeSize = testElement.offsetWidth + testElement.offsetHeight;
    testElement.style.fontFamily = "Arial, sans-serif";
    const afterSize = testElement.offsetWidth + testElement.offsetHeight;
    testElement.remove();
    return beforeSize !== afterSize;
  }
  // Obtener icono por defecto
  getDefaultIcon() {
    return this.config.defaultIcon || "detail";
  }
}
class XDiagramsThumbnailResolver {
  constructor(iconManager) {
    this.iconManager = iconManager;
  }
  /**
   * Resuelve el thumbnail para un nodo
   * @param {Object} node - El nodo para resolver el thumbnail
   * @returns {Object} Objeto con type y value del thumbnail
   */
  resolveThumbnail(node) {
    const img = node.img || node.data && node.data.img;
    const layout = node.layout || node.data && node.data.layout;
    if (img) {
      const imgResult = this.resolveFromValue(img);
      if (imgResult) {
        return imgResult;
      }
    }
    if (!img && layout) {
      const layoutResult = this.resolveFromValue(layout);
      if (layoutResult) {
        return layoutResult;
      }
    }
    return { type: "custom-icon", value: this.iconManager.getDefaultIcon() };
  }
  /**
   * Resuelve un valor específico (img o layout)
   * @param {string} value - El valor a resolver
   * @returns {Object|null} Objeto con type y value, o null si no es válido
   */
  resolveFromValue(value) {
    if (this.iconManager.isValidCustomIcon(value)) {
      const normalizedValue = this.iconManager.normalizeIconName(value);
      return { type: "custom-icon", value: normalizedValue };
    }
    if (this.iconManager.isExternalImageUrl(value)) {
      return { type: "external-image", value };
    }
    return null;
  }
  /**
   * Obtiene el tipo de thumbnail para un valor
   * @param {string} value - El valor a analizar
   * @returns {string} Tipo de thumbnail ('custom-icon', 'external-image', o 'unknown')
   */
  getThumbnailType(value) {
    if (this.iconManager.isValidCustomIcon(value)) {
      return "custom-icon";
    }
    if (this.iconManager.isExternalImageUrl(value)) {
      return "external-image";
    }
    return "unknown";
  }
  /**
   * Valida si un nodo tiene un thumbnail válido
   * @param {Object} node - El nodo a validar
   * @returns {boolean} True si el nodo tiene un thumbnail válido
   */
  hasValidThumbnail(node) {
    const img = node.img || node.data && node.data.img;
    const layout = node.layout || node.data && node.data.layout;
    return img && this.getThumbnailType(img) !== "unknown" || layout && this.getThumbnailType(layout) !== "unknown";
  }
}
class XDiagramsThumbnailRenderer {
  constructor(iconManager) {
    this.iconManager = iconManager;
  }
  /**
   * Crea un elemento de thumbnail para un nodo
   * @param {Object} node - El nodo para crear el thumbnail
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho del thumbnail
   * @param {number} height - Alto del thumbnail
   * @param {Object} thumbnail - Objeto con type y value del thumbnail
   * @returns {Object} Elemento D3 creado
   */
  createThumbnailElement(node, container, x, y, width, height, thumbnail) {
    if (thumbnail.type === "custom-icon") {
      return this.createCustomIconElement(container, x, y, thumbnail.value);
    } else if (thumbnail.type === "external-image") {
      return this.createExternalImageElement(container, x, y, width, height, thumbnail.value);
    }
    return this.createDefaultIconElement(container, x, y);
  }
  /**
   * Crea un elemento de icono personalizado
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {string} iconName - Nombre del icono
   * @returns {Object} Elemento D3 creado
   */
  createCustomIconElement(container, x, y, iconName) {
    const unicode = this.iconManager.getIconUnicode(iconName);
    return container.append("text").attr("x", x).attr("y", y).attr("font-family", "xdiagrams-icons").attr("font-size", "82px").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", "embedded-thumbnail").text(unicode).style("opacity", 0);
  }
  /**
   * Crea un elemento de imagen externa
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho de la imagen
   * @param {number} height - Alto de la imagen
   * @param {string} imageUrl - URL de la imagen
   * @returns {Object} Elemento D3 creado
   */
  createExternalImageElement(container, x, y, width, height, imageUrl) {
    return container.append("image").attr("x", x - width / 2).attr("y", y - height / 2 - 10).attr("width", width).attr("height", height).attr("href", imageUrl).style("opacity", 0).on("error", function() {
      console.error("Failed to load external image:", imageUrl);
      d3.select(this).remove();
      return this.createDefaultIconElement(container, x, y);
    }.bind(this));
  }
  /**
   * Crea un elemento de icono por defecto
   * @param {Object} container - El contenedor D3
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @returns {Object} Elemento D3 creado
   */
  createDefaultIconElement(container, x, y) {
    const defaultUnicode = this.iconManager.getIconUnicode(this.iconManager.getDefaultIcon());
    return container.append("text").attr("x", x).attr("y", y).attr("font-family", "xdiagrams-icons").attr("font-size", "82px").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", "embedded-thumbnail").text(defaultUnicode).style("opacity", 0);
  }
  /**
   * Aplica estilos comunes a un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {Object} styles - Objeto con estilos a aplicar
   */
  applyStyles(element, styles = {}) {
    Object.entries(styles).forEach(([property, value]) => {
      element.style(property, value);
    });
  }
  /**
   * Actualiza la posición de un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {number} x - Nueva posición X
   * @param {number} y - Nueva posición Y
   */
  updatePosition(element, x, y) {
    element.attr("x", x).attr("y", y);
  }
  /**
   * Actualiza el tamaño de un elemento de thumbnail
   * @param {Object} element - El elemento D3
   * @param {number} width - Nuevo ancho
   * @param {number} height - Nuevo alto
   */
  updateSize(element, width, height) {
    element.attr("width", width).attr("height", height);
  }
}
class XDiagramsThumbnailAnimator {
  constructor(iconManager) {
    this.iconManager = iconManager;
    this.animationDelay = 100;
    this.fadeInDuration = 300;
  }
  /**
   * Muestra iconos con fade-in
   */
  showIconsWithFadeIn() {
    if (this.iconManager.isCustomIconsLoaded()) {
      this.showAllIcons();
    } else {
      setTimeout(() => this.showIconsWithFadeIn(), this.animationDelay);
    }
  }
  /**
   * Muestra todos los iconos con animación
   */
  showAllIcons() {
    this.showCustomIcons();
    this.showExternalImages();
  }
  /**
   * Muestra iconos personalizados con fade-in
   */
  showCustomIcons() {
    d3.selectAll('text[font-family="xdiagrams-icons"]').transition().duration(this.fadeInDuration).style("opacity", 1);
  }
  /**
   * Muestra imágenes externas con fade-in
   */
  showExternalImages() {
    d3.selectAll("image[href]").transition().duration(this.fadeInDuration).style("opacity", 1);
  }
  /**
   * Oculta todos los iconos
   */
  hideAllIcons() {
    d3.selectAll('text[font-family="xdiagrams-icons"]').style("opacity", 0);
    d3.selectAll("image[href]").style("opacity", 0);
  }
  /**
   * Muestra un icono específico con fade-in
   * @param {Object} element - El elemento D3 a animar
   * @param {number} duration - Duración de la animación (opcional)
   */
  showIconWithFadeIn(element, duration = this.fadeInDuration) {
    element.transition().duration(duration).style("opacity", 1);
  }
  /**
   * Oculta un icono específico con fade-out
   * @param {Object} element - El elemento D3 a animar
   * @param {number} duration - Duración de la animación (opcional)
   */
  hideIconWithFadeOut(element, duration = this.fadeInDuration) {
    element.transition().duration(duration).style("opacity", 0);
  }
  /**
   * Configura la duración de las animaciones
   * @param {number} duration - Duración en milisegundos
   */
  setAnimationDuration(duration) {
    this.fadeInDuration = duration;
  }
  /**
   * Configura el delay de las animaciones
   * @param {number} delay - Delay en milisegundos
   */
  setAnimationDelay(delay) {
    this.animationDelay = delay;
  }
  /**
   * Verifica si los iconos están listos para animar
   * @returns {boolean} True si los iconos están cargados
   */
  areIconsReady() {
    return this.iconManager.isCustomIconsLoaded();
  }
}
class XDiagramsThumbs {
  constructor(config = {}) {
    this.iconManager = new XDiagramsIconManager(config);
    this.resolver = new XDiagramsThumbnailResolver(this.iconManager);
    this.renderer = new XDiagramsThumbnailRenderer(this.iconManager);
    this.animator = new XDiagramsThumbnailAnimator(this.iconManager);
  }
  // Métodos de coordinación esencial
  resolveThumbnail(node) {
    return this.resolver.resolveThumbnail(node);
  }
  createThumbnailElement(node, container, x, y, width, height) {
    const thumbnail = this.resolver.resolveThumbnail(node);
    return this.renderer.createThumbnailElement(node, container, x, y, width, height, thumbnail);
  }
  showIconsWithFadeIn() {
    return this.animator.showIconsWithFadeIn();
  }
  // Acceso directo a los submódulos para casos específicos
  get iconManagerInstance() {
    return this.iconManager;
  }
  get resolverInstance() {
    return this.resolver;
  }
  get rendererInstance() {
    return this.renderer;
  }
  get animatorInstance() {
    return this.animator;
  }
}
class XDiagramsTextHandler {
  constructor(config = {}) {
    this.config = {
      maxWidth: 80,
      maxLines: 2,
      fontSize: 8,
      nodeNameFontSize: 9,
      // Tamaño específico para el nombre del nodo
      lineHeight: 1.2,
      fontFamily: "Arial, sans-serif",
      textAnchor: "middle",
      dominantBaseline: "middle",
      ellipsis: "...",
      fontWeight: "bold",
      ...config
    };
  }
  /**
   * Renderiza texto con manejo inteligente
   * @param {d3.Selection} container - Contenedor SVG donde renderizar el texto
   * @param {string} text - Texto a renderizar
   * @param {Object} options - Opciones de configuración
   * @returns {d3.Selection} - Elemento de texto creado
   */
  renderText(container, text, options = {}) {
    const config = { ...this.config, ...options };
    if (!text || text.trim() === "") {
      return container.append("text").attr("class", "empty-text").style("display", "none");
    }
    const textGroup = container.append("g").attr("class", "text-group");
    const textElement = textGroup.append("text").attr("class", "smart-text").style("font-family", config.fontFamily).style("font-size", config.fontSize + "px").style("font-weight", config.fontWeight || "normal").style("text-anchor", config.textAnchor).style("dominant-baseline", config.dominantBaseline);
    this.wrapText(textElement, text, config);
    return textElement;
  }
  /**
   * Implementación optimizada de wrap de texto
   */
  wrapText(textElement, text, config) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + " " + words[i] : words[i];
      const testElement = textElement.text(testLine);
      const node = testElement.node();
      let textWidth = 0;
      if (node && typeof node.getComputedTextLength === "function") {
        textWidth = node.getComputedTextLength();
      } else {
        const avgCharWidth = config.fontSize * 0.6;
        textWidth = testLine.length * avgCharWidth;
      }
      if (textWidth > config.maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    if (lines.length > config.maxLines) {
      lines.splice(config.maxLines);
      if (lines[config.maxLines - 1]) {
        lines[config.maxLines - 1] = this.truncateText(lines[config.maxLines - 1], config.maxWidth, config.ellipsis);
      }
    }
    textElement.text("");
    lines.forEach((line, index) => {
      textElement.append("tspan").attr("x", 0).attr("dy", index === 0 ? "0" : config.lineHeight + "em").text(line);
    });
  }
  /**
   * Trunca texto con ellipsis si es necesario
   */
  truncateText(text, maxWidth, ellipsis) {
    const testElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    testElement.style.fontFamily = this.config.fontFamily;
    testElement.style.fontSize = this.config.fontSize + "px";
    testElement.style.fontWeight = this.config.fontWeight || "normal";
    let truncatedText = text;
    let ellipsisText = ellipsis;
    while (truncatedText.length > 0) {
      testElement.textContent = truncatedText + ellipsisText;
      const textWidth = testElement.getComputedTextLength();
      if (textWidth <= maxWidth) {
        break;
      }
      truncatedText = truncatedText.slice(0, -1);
    }
    return truncatedText + ellipsisText;
  }
  /**
   * Renderiza texto para nodos con posición específica
   */
  renderNodeText(container, text, x, y, options = {}) {
    const textElement = this.renderText(container, text, options);
    textElement.attr("x", x).attr("y", y);
    return textElement;
  }
  /**
   * Renderiza texto centrado verticalmente en el espacio disponible
   */
  renderNodeTextCentered(container, text, x, y, options = {}) {
    const config = { ...this.config, ...options };
    if (!text || text.trim() === "") {
      return container.append("text").attr("class", "empty-text").attr("x", x).attr("y", y).style("display", "none");
    }
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + " " + words[i] : words[i];
      const testElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      testElement.style.fontFamily = config.fontFamily;
      testElement.style.fontSize = config.fontSize + "px";
      testElement.style.fontWeight = config.fontWeight || "normal";
      testElement.textContent = testLine;
      let textWidth = 0;
      if (testElement.getComputedTextLength) {
        textWidth = testElement.getComputedTextLength();
      } else {
        const avgCharWidth = config.fontSize * 0.6;
        textWidth = testLine.length * avgCharWidth;
      }
      if (textWidth > config.maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    if (lines.length > config.maxLines) {
      lines.splice(config.maxLines);
    }
    let adjustedY = y;
    let baseline = config.dominantBaseline;
    if (lines.length === 1) {
      adjustedY = y + 8;
      baseline = "hanging";
    } else {
      adjustedY = y - 5;
      baseline = "middle";
    }
    const textGroup = container.append("g").attr("class", "text-group").attr("transform", `translate(${x}, ${adjustedY})`);
    const textElement = textGroup.append("text").attr("class", "smart-text").style("font-family", config.fontFamily).style("font-size", config.fontSize + "px").style("font-weight", config.fontWeight || "normal").style("text-anchor", config.textAnchor).style("dominant-baseline", baseline);
    this.wrapText(textElement, text, config);
    return textElement;
  }
  /**
   * Actualiza configuración
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}
class XDiagramsZoomControls {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.zoomControls = null;
    this.zoomInput = null;
  }
  create() {
    document.getElementById("zoom-controls")?.remove();
    const zoomControls = document.createElement("div");
    zoomControls.id = "zoom-controls";
    zoomControls.className = "zoom-controls";
    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.className = "zoom-btn";
    zoomOutBtn.innerHTML = "−";
    zoomOutBtn.title = "Reducir zoom";
    zoomOutBtn.onclick = () => this.adjustZoom(-0.08);
    const inputContainer = document.createElement("div");
    inputContainer.className = "zoom-input-container";
    const zoomInput = document.createElement("input");
    zoomInput.className = "zoom-input";
    zoomInput.type = "text";
    zoomInput.placeholder = "100";
    zoomInput.title = "Nivel de zoom en porcentaje (6-150%)";
    zoomInput.onchange = (e) => this.setZoomFromInput(e.target.value);
    zoomInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.target.blur();
      }
    };
    const zoomPercent = document.createElement("span");
    zoomPercent.className = "zoom-percent-inline";
    zoomPercent.textContent = "%";
    const zoomInBtn = document.createElement("button");
    zoomInBtn.className = "zoom-btn";
    zoomInBtn.innerHTML = "+";
    zoomInBtn.title = "Aumentar zoom";
    zoomInBtn.onclick = () => this.adjustZoom(0.08);
    inputContainer.appendChild(zoomInput);
    inputContainer.appendChild(zoomPercent);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(inputContainer);
    zoomControls.appendChild(zoomInBtn);
    document.body.appendChild(zoomControls);
    this.zoomControls = zoomControls;
    this.zoomInput = zoomInput;
  }
  updateZoomInput(scale) {
    if (this.zoomInput) {
      this.zoomInput.value = Math.round(scale * 100);
    }
  }
  resetZoom(container) {
    const svg = d3.select("#diagram");
    this.navigation.clusterNavInstance.deselectActiveCluster();
    try {
      d3.selectAll(".node rect").classed("node-selected", false).style("stroke", null).style("stroke-width", null).style("fill", null);
    } catch (_) {
    }
    const initialTransform = this.core.navigation?.zoomManagerInstance?.getInitialTransform();
    if (initialTransform) {
      if (this.core.uiManager && typeof this.core.uiManager.closeInfoPanel === "function") {
        this.core.uiManager.closeInfoPanel();
      }
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(initialTransform, 1e3);
      } else {
        svg.transition().duration(1e3).ease(d3.easeCubicOut).call(d3.zoom().transform, initialTransform);
      }
      document.getElementById("zoom-status")?.style.setProperty("display", "none");
      return;
    }
    const svgNode2 = svg.node();
    const svgRect = svgNode2.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    const realBounds = this.core.calculateDiagramBounds();
    if (this.core.uiManager && typeof this.core.uiManager.closeInfoPanel === "function") {
      this.core.uiManager.closeInfoPanel();
    }
    const actualWidth = realBounds.width || 8e3;
    const actualHeight = realBounds.height || 8e3;
    const scaleX = svgWidth / actualWidth;
    const scaleY = svgHeight / actualHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    const scaledDiagramWidth = actualWidth * scale;
    const scaledDiagramHeight = actualHeight * scale;
    const translateX = (svgWidth - scaledDiagramWidth) / 2;
    const translateY = (svgHeight - scaledDiagramHeight) / 2;
    const targetTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.zoomTo(targetTransform, this.core.config.transitionDuration.reset);
    } else {
      svg.transition().duration(this.core.config.transitionDuration.reset).ease(d3.easeCubicOut).call(d3.zoom().transform, targetTransform);
    }
    document.getElementById("zoom-status")?.style.setProperty("display", "none");
  }
  adjustZoom(delta) {
    if (!this.core.navigation || !this.core.navigation.zoomManagerInstance)
      return;
    const svg = d3.select("#diagram");
    const svgNode2 = svg.node();
    const svgRect = svgNode2.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    const currentTransform = d3.zoomTransform(svgNode2);
    const initialTransform = this.core.navigation?.zoomManagerInstance?.getInitialTransform();
    if (currentTransform.k < 0.05 && delta > 0 && initialTransform) {
      const initialScale = initialTransform.k;
      const viewportCenterX2 = svgWidth / 2;
      const viewportCenterY2 = svgHeight / 2;
      const scaleRatio2 = initialScale / currentTransform.k;
      const newX2 = viewportCenterX2 - (viewportCenterX2 - currentTransform.x) * scaleRatio2;
      const newY2 = viewportCenterY2 - (viewportCenterY2 - currentTransform.y) * scaleRatio2;
      const newTransform2 = d3.zoomIdentity.translate(newX2, newY2).scale(initialScale);
      this.core.navigation.zoomManagerInstance.zoomTo(newTransform2, 300);
      return;
    }
    let jumpSize;
    if (delta > 0) {
      if (currentTransform.k >= 1) {
        jumpSize = 0.75;
      } else if (currentTransform.k >= 0.5) {
        jumpSize = 0.5;
      } else if (currentTransform.k >= 0.25) {
        jumpSize = 0.25;
      } else {
        jumpSize = 0.1;
      }
    } else {
      if (currentTransform.k >= 1) {
        jumpSize = 0.5;
      } else if (currentTransform.k >= 0.5) {
        jumpSize = 0.25;
      } else if (currentTransform.k >= 0.25) {
        jumpSize = 0.15;
      } else {
        jumpSize = 0.1;
      }
    }
    const actualDelta = delta > 0 ? jumpSize : -jumpSize;
    const newScale = Math.max(0.05, Math.min(2, currentTransform.k + actualDelta));
    const viewportCenterX = svgWidth / 2;
    const viewportCenterY = svgHeight / 2;
    const scaleRatio = newScale / currentTransform.k;
    const newX = viewportCenterX - (viewportCenterX - currentTransform.x) * scaleRatio;
    const newY = viewportCenterY - (viewportCenterY - currentTransform.y) * scaleRatio;
    const newTransform = d3.zoomIdentity.translate(newX, newY).scale(newScale);
    this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
  }
  setZoomFromInput(value) {
    if (!this.core.navigation || !this.core.navigation.zoomManagerInstance)
      return;
    const percentage = parseFloat(value);
    if (isNaN(percentage) || percentage < 6 || percentage > 200) {
      const svg2 = d3.select("#diagram");
      const currentTransform2 = d3.zoomTransform(svg2.node());
      this.zoomInput.value = Math.round(currentTransform2.k * 100);
      return;
    }
    const scale = percentage / 100;
    const svg = d3.select("#diagram");
    const svgNode2 = svg.node();
    const svgRect = svgNode2.getBoundingClientRect();
    const { width: svgWidth, height: svgHeight } = svgRect;
    const currentTransform = d3.zoomTransform(svgNode2);
    const viewportCenterX = svgWidth / 2;
    const viewportCenterY = svgHeight / 2;
    const scaleRatio = scale / currentTransform.k;
    const newX = viewportCenterX - (viewportCenterX - currentTransform.x) * scaleRatio;
    const newY = viewportCenterY - (viewportCenterY - currentTransform.y) * scaleRatio;
    const newTransform = d3.zoomIdentity.translate(newX, newY).scale(scale);
    this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
  }
  destroy() {
    if (this.zoomControls) {
      this.zoomControls.remove();
      this.zoomControls = null;
      this.zoomInput = null;
    }
  }
}
class XDiagramsZoomManager {
  constructor() {
    this.zoom = null;
    this.currentTransform = null;
    this.initialTransform = null;
    this.zoomChangeListeners = [];
  }
  setupZoom(diagram, navigation) {
    this.zoom = d3.zoom().scaleExtent([0.05, 2]).wheelDelta((event2) => -event2.deltaY * 2e-3).on("zoom", (event2) => {
      const transform2 = event2.sourceEvent?.type === "mousemove" ? d3.zoomIdentity.translate(event2.transform.x, event2.transform.y).scale(d3.zoomTransform(diagram.node()).k) : event2.transform;
      this.currentTransform = transform2;
      const container = diagram.select("g");
      if (!container.empty()) {
        container.attr("transform", transform2);
      }
      this.applyZoomBasedClusterClasses(transform2.k);
      this.notifyZoomChangeListeners(transform2.k);
      this.updateInfoPanel(transform2);
      if (navigation && navigation.zoomControlsInstance) {
        navigation.zoomControlsInstance.updateZoomInput(transform2.k);
      }
    });
    diagram.call(this.zoom).on("dblclick.zoom", null);
    return this.zoom;
  }
  getCurrentZoom() {
    const diagram = d3.select("#diagram");
    if (diagram.empty())
      return 1;
    const node = diagram.node();
    return d3.zoomTransform(node).k;
  }
  getCurrentTransform() {
    return this.currentTransform;
  }
  zoomTo(transform2, duration = 750) {
    if (!this.zoom)
      return;
    const diagram = d3.select("#diagram");
    if (diagram.empty())
      return;
    diagram.transition().duration(duration).ease(d3.easeCubicOut).call(this.zoom.transform, transform2);
  }
  zoomToImmediate(transform2) {
    if (!this.zoom)
      return;
    const diagram = d3.select("#diagram");
    if (diagram.empty())
      return;
    diagram.call(this.zoom.transform, transform2);
  }
  zoomToScale(scale) {
    if (!this.currentTransform)
      return;
    const newTransform = d3.zoomIdentity.translate(this.currentTransform.x, this.currentTransform.y).scale(scale);
    this.zoomTo(newTransform);
  }
  resetZoom() {
    if (!this.zoom)
      return;
    const diagram = d3.select("#diagram");
    if (diagram.empty())
      return;
    diagram.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
  }
  updateInfoPanel(transform2) {
    if (this.navigation && this.navigation.core && this.navigation.core.uiManager) {
      this.navigation.core.uiManager.updateInfoPanel(transform2);
    }
  }
  destroyZoom() {
    if (this.zoom) {
      const diagram = d3.select("#diagram");
      if (!diagram.empty()) {
        diagram.on(".zoom", null);
      }
      this.zoom = null;
      this.currentTransform = null;
    }
  }
  getZoomInstance() {
    return this.zoom;
  }
  setInitialTransform(transform2) {
    this.initialTransform = transform2;
  }
  getInitialTransform() {
    return this.initialTransform;
  }
  /**
   * Apply zoom-based CSS classes to cluster backgrounds for different hover styles
   * @param {number} zoomLevel - Current zoom level (transform.k)
   */
  applyZoomBasedClusterClasses(zoomLevel) {
    const clusterBgs = d3.selectAll(".cluster-bg");
    if (clusterBgs.empty()) {
      return;
    }
    clusterBgs.classed("zoom-out", false).classed("zoom-in", false);
    if (zoomLevel <= 0.1) {
      clusterBgs.classed("zoom-out", true);
      console.log("[ZoomClasses] Applied zoom-out class (zoom <= 10%):", zoomLevel);
    } else {
      clusterBgs.classed("zoom-in", true);
      console.log("[ZoomClasses] Applied zoom-in class (zoom > 10%):", zoomLevel);
    }
  }
  /**
   * Registrar un listener para cambios de zoom
   * @param {Function} listener - Función a llamar cuando cambie el zoom
   */
  onZoomChange(listener) {
    this.zoomChangeListeners.push(listener);
  }
  /**
   * Notificar a todos los listeners de cambio de zoom
   * @param {number} zoomLevel - Nivel de zoom actual
   */
  notifyZoomChangeListeners(zoomLevel) {
    this.zoomChangeListeners.forEach((listener) => {
      try {
        listener(zoomLevel);
      } catch (error) {
        console.error("[ZoomManager] Error en listener de zoom:", error);
      }
    });
  }
}
class XDiagramsKeyboardNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.keyboardHandler = null;
  }
  setup(container) {
    this.keyboardHandler = (event2) => {
      if (event2.__xdiHandled)
        return;
      event2.__xdiHandled = true;
      if ((event2.metaKey || event2.ctrlKey) && (event2.key === "=" || event2.key === "+")) {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.adjustZoom(0.01);
        return false;
      } else if ((event2.metaKey || event2.ctrlKey) && event2.key === "-") {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.adjustZoom(-0.01);
        return false;
      } else if ((event2.metaKey || event2.ctrlKey) && event2.key === "0") {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.zoomControlsInstance.resetZoom(container);
        return false;
      } else if (event2.key === "Tab") {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.escapeLevel = 0;
        const selectedNode = d3.select(".node-selected");
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.handleTabNavigation();
        } else {
          this.navigation.clusterNavInstance.handleTabNavigation();
        }
      } else if (event2.key === "Enter") {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.escapeLevel = 0;
        const selectedNode = d3.select(".node-selected");
        if (!selectedNode.empty()) {
          return;
        }
        const allClusters = d3.selectAll(".cluster-bg");
        if (allClusters.empty()) {
          return;
        }
        const currentCluster = d3.select(".cluster-bg:focus");
        const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
        if (currentIndex === -1) {
          const firstCluster = allClusters.nodes()[0];
          if (firstCluster) {
            d3.select(firstCluster).node().focus();
            const clusterGroup = d3.select(firstCluster.parentNode);
            this.navigation.clusterNavInstance.highlightCluster(clusterGroup);
            this.navigation.clusterNavInstance.zoomToCluster(clusterGroup, this.core.globalContainer, true);
          }
          return;
        }
        this.navigation.nodeNavInstance.selectFirstNodeInCluster(currentCluster);
      } else if (event2.key === "Escape") {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        const selectedNode = d3.select(".node-selected");
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.exitNodeNavigationMode();
          this.navigation.escapeLevel = 1;
        } else if (this.navigation.escapeLevel === 1) {
          this.navigation.zoomControlsInstance.resetZoom(container);
          this.navigation.escapeLevel = 0;
        } else {
          this.navigation.zoomControlsInstance.resetZoom(container);
          this.navigation.escapeLevel = 0;
        }
      } else if (event2.key === "R" && event2.ctrlKey && event2.shiftKey) {
        event2.preventDefault();
        this.core.clearCacheAndReload();
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event2.key)) {
        event2.preventDefault();
        event2.stopPropagation();
        event2.stopImmediatePropagation();
        this.navigation.escapeLevel = 0;
        const selectedNode = d3.select(".node-selected");
        if (!selectedNode.empty()) {
          this.navigation.nodeNavInstance.handleNodeArrowNavigation(event2.key);
        } else {
          this.navigation.clusterNavInstance.handleArrowNavigation(event2.key);
        }
      }
    };
    document.addEventListener("keydown", this.keyboardHandler, { capture: true, passive: false });
    if (navigator.userAgent.includes("Firefox")) {
      document.addEventListener("keydown", this.keyboardHandler, { passive: false });
    }
  }
  initialize() {
    d3.selectAll(".cluster-bg");
    const firstCluster = d3.select(".cluster-bg").node();
    if (firstCluster) {
      firstCluster.focus();
    }
  }
  destroy() {
    if (this.keyboardHandler) {
      document.removeEventListener("keydown", this.keyboardHandler, { capture: true });
      if (navigator.userAgent.includes("Firefox")) {
        document.removeEventListener("keydown", this.keyboardHandler);
      }
      this.keyboardHandler = null;
    }
  }
}
class XDiagramsClusterNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    window.addEventListener("resize", () => {
      this.updateOverlayPosition();
    });
  }
  zoomToCluster(clusterGroup, container, isTabNavigation = false, shouldDeselectNode = true) {
    try {
      const selectedNode = d3.select(".node-selected");
      if (!selectedNode.empty() && shouldDeselectNode) {
        this.core.uiManager.closeInfoPanel();
        d3.selectAll(".node-selected").classed("node-selected", false).style("stroke", null).style("stroke-width", null).style("fill", null);
        this.navigation.escapeLevel = 0;
      }
      if (!clusterGroup || clusterGroup.empty())
        return;
      const svg = d3.select("#diagram");
      if (svg.empty())
        return;
      const svgNode2 = svg.node();
      const svgRect = svgNode2.getBoundingClientRect();
      const { width: svgWidth, height: svgHeight } = svgRect;
      if (svgWidth <= 0 || svgHeight <= 0)
        return;
      const clusterBg = clusterGroup.select(".cluster-bg");
      if (clusterBg.empty())
        return;
      const clusterWidth = parseFloat(clusterBg.attr("width"));
      const clusterHeight = parseFloat(clusterBg.attr("height"));
      if (isNaN(clusterWidth) || isNaN(clusterHeight) || clusterWidth <= 0 || clusterHeight <= 0)
        return;
      const clusterTitle = clusterGroup.select(".cluster-title").attr("data-cluster-name") || clusterGroup.select(".cluster-title").text();
      const originalPosition = this.core.clusterPositions.get(clusterTitle);
      let clusterX = 0, clusterY = 0;
      if (originalPosition) {
        clusterX = originalPosition.x;
        clusterY = originalPosition.y;
      } else {
        const clusterTransform = clusterGroup.attr("transform");
        if (clusterTransform) {
          const match = clusterTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
          if (match) {
            clusterX = parseFloat(match[1]);
            clusterY = parseFloat(match[2]);
          }
        }
      }
      const clusterCenterX = clusterX + clusterWidth / 2;
      const clusterCenterY = clusterY + clusterHeight / 2;
      const screenSize = Math.min(svgWidth, svgHeight);
      const padding = screenSize < 768 ? 30 : screenSize < 1024 ? 50 : 80;
      const scaleX = (svgWidth - padding * 2) / clusterWidth;
      const scaleY = (svgHeight - padding * 2) / clusterHeight;
      const maxZoom = screenSize < 768 ? 1.8 : screenSize < 1024 ? 2 : 2.2;
      const scale = Math.min(scaleX, scaleY, maxZoom);
      if (isNaN(scale) || scale <= 0)
        return;
      const newX = svgWidth / 2 - clusterCenterX * scale;
      const newY = svgHeight / 2 - clusterCenterY * scale;
      const newTransform = d3.zoomIdentity.translate(newX, newY).scale(scale);
      const transitionDuration = isTabNavigation ? this.core.config.transitionDuration.tab : this.core.config.transitionDuration.click;
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, transitionDuration);
      } else {
        svg.transition().duration(transitionDuration).ease(d3.easeCubicOut).call(d3.zoom().transform, newTransform);
      }
      if (this.core.uiManager) {
        this.core.uiManager.updateInfoPanel({ k: scale, x: newX, y: newY });
      }
      const zoomStatus = document.getElementById("zoom-status");
      if (zoomStatus) {
        zoomStatus.style.display = "block";
        setTimeout(() => zoomStatus.style.display = "none", 2e3);
      }
      const bg = clusterGroup.select(".cluster-bg");
      if (!bg.empty()) {
        this.clearClusterSelection();
        bg.classed("cluster-focused", true);
        bg.attr("data-selected", "true");
        bg.style("outline", "none");
        bg.node().focus();
        this.removeNodeBlockerOverlay();
        this.applySelectedClusterStyle(clusterGroup);
      }
    } catch (error) {
    }
  }
  handleTabNavigation() {
    const currentCluster = d3.select(".cluster-bg:focus");
    const allClusters = d3.selectAll(".cluster-bg");
    if (allClusters.empty()) {
      return;
    }
    const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
    const nextIndex = event.shiftKey ? currentIndex <= 0 ? allClusters.size() - 1 : currentIndex - 1 : currentIndex >= allClusters.size() - 1 ? 0 : currentIndex + 1;
    const nextCluster = allClusters.nodes()[nextIndex];
    if (!nextCluster) {
      return;
    }
    d3.select(nextCluster).node().focus();
    const clusterGroup = d3.select(nextCluster.parentNode);
    if (clusterGroup.empty()) {
      return;
    }
    this.applyClusterStyle(clusterGroup, "#28a745", "6px");
    setTimeout(() => {
      this.applyClusterStyle(clusterGroup, "#007bff", "4px");
    }, 200);
    this.zoomToCluster(clusterGroup, this.core.globalContainer, true);
  }
  handleArrowNavigation(arrowKey) {
    const allClusters = d3.selectAll(".cluster-bg");
    if (allClusters.empty()) {
      return;
    }
    const currentCluster = d3.select(".cluster-bg:focus");
    const currentIndex = currentCluster.empty() ? -1 : Array.from(allClusters.nodes()).indexOf(currentCluster.node());
    if (currentIndex === -1) {
      const firstCluster = allClusters.nodes()[0];
      if (firstCluster) {
        d3.select(firstCluster).node().focus();
        const clusterGroup = d3.select(firstCluster.parentNode);
        this.highlightCluster(clusterGroup);
        this.zoomToCluster(clusterGroup, this.core.globalContainer, true);
      }
      return;
    }
    let nextIndex;
    switch (arrowKey) {
      case "ArrowUp":
        nextIndex = this.getClusterInPreviousRow(currentIndex, allClusters);
        break;
      case "ArrowDown":
        nextIndex = this.getClusterInNextRow(currentIndex, allClusters);
        break;
      case "ArrowLeft":
        nextIndex = this.getPreviousClusterInRow(currentIndex, allClusters);
        break;
      case "ArrowRight":
        nextIndex = this.getNextClusterInRow(currentIndex, allClusters);
        break;
      default:
        return;
    }
    const nextCluster = allClusters.nodes()[nextIndex];
    if (!nextCluster) {
      return;
    }
    d3.select(nextCluster).node().focus();
    this.highlightCluster(d3.select(nextCluster.parentNode));
    this.zoomToCluster(d3.select(nextCluster.parentNode), this.core.globalContainer, true);
  }
  getPreviousClusterInRow(currentIndex, allClusters) {
    return this._findClusterInRow(currentIndex, allClusters, "previous");
  }
  getNextClusterInRow(currentIndex, allClusters) {
    return this._findClusterInRow(currentIndex, allClusters, "next");
  }
  _findClusterInRow(currentIndex, allClusters, direction) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentY = currentRect.top;
    const currentX = currentRect.left;
    let bestIndex = currentIndex;
    let minDistance = Infinity;
    allClusters.each(function(d, i) {
      if (i === currentIndex)
        return;
      const rect = this.getBoundingClientRect();
      const yDiff = Math.abs(rect.top - currentY);
      if (yDiff < 50) {
        const isPrevious = direction === "previous" && rect.left < currentX;
        const isNext = direction === "next" && rect.left > currentX;
        if (isPrevious || isNext) {
          const distance = Math.abs(rect.left - currentX);
          if (distance < minDistance) {
            minDistance = distance;
            bestIndex = i;
          }
        }
      }
    });
    if (bestIndex === currentIndex) {
      if (direction === "previous") {
        bestIndex = this.getLastClusterInPreviousRow(currentIndex, allClusters);
        if (bestIndex === currentIndex) {
          bestIndex = allClusters.size() - 1;
        }
      } else {
        bestIndex = this.getFirstClusterInNextRow(currentIndex, allClusters);
        if (bestIndex === currentIndex) {
          bestIndex = 0;
        }
      }
    }
    return bestIndex;
  }
  getClusterInPreviousRow(currentIndex, allClusters) {
    return this._findClusterInAdjacentRow(currentIndex, allClusters, "previous");
  }
  getClusterInNextRow(currentIndex, allClusters) {
    return this._findClusterInAdjacentRow(currentIndex, allClusters, "next");
  }
  _findClusterInAdjacentRow(currentIndex, allClusters, direction) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top;
    let bestIndex = currentIndex;
    let minVerticalDistance = Infinity;
    let bestHorizontalDistance = Infinity;
    allClusters.each(function(d, i) {
      if (i === currentIndex)
        return;
      const rect = this.getBoundingClientRect();
      const clusterCenterX = rect.left + rect.width / 2;
      const clusterY = rect.top;
      const yDiff = direction === "previous" ? currentY - clusterY : clusterY - currentY;
      if (yDiff > 50) {
        const horizontalDistance = Math.abs(clusterCenterX - currentX);
        if (yDiff < minVerticalDistance) {
          minVerticalDistance = yDiff;
          bestIndex = i;
          bestHorizontalDistance = horizontalDistance;
        } else if (Math.abs(yDiff - minVerticalDistance) < 10 && horizontalDistance < bestHorizontalDistance) {
          bestIndex = i;
          bestHorizontalDistance = horizontalDistance;
        }
      }
    });
    if (bestIndex === currentIndex) {
      bestIndex = direction === "previous" ? allClusters.size() - 1 : 0;
    }
    return bestIndex;
  }
  getLastClusterInPreviousRow(currentIndex, allClusters) {
    return this._findClusterAtRowExtreme(currentIndex, allClusters, "previous", "last");
  }
  getFirstClusterInNextRow(currentIndex, allClusters) {
    return this._findClusterAtRowExtreme(currentIndex, allClusters, "next", "first");
  }
  _findClusterAtRowExtreme(currentIndex, allClusters, direction, extreme) {
    const currentCluster = allClusters.nodes()[currentIndex];
    const currentRect = currentCluster.getBoundingClientRect();
    const currentY = currentRect.top;
    let bestIndex = currentIndex;
    let minVerticalDistance = Infinity;
    let extremePosition = extreme === "first" ? Infinity : -Infinity;
    allClusters.each(function(d, i) {
      if (i === currentIndex)
        return;
      const rect = this.getBoundingClientRect();
      const yDiff = direction === "previous" ? currentY - rect.top : rect.top - currentY;
      if (yDiff > 50) {
        if (yDiff < minVerticalDistance) {
          minVerticalDistance = yDiff;
          bestIndex = i;
          extremePosition = rect.left;
        } else if (Math.abs(yDiff - minVerticalDistance) < 10) {
          const isBetterExtreme = extreme === "first" ? rect.left < extremePosition : rect.left > extremePosition;
          if (isBetterExtreme) {
            bestIndex = i;
            extremePosition = rect.left;
          }
        }
      }
    });
    return bestIndex;
  }
  highlightCluster(clusterGroup) {
    d3.selectAll(".cluster-bg:not(.cluster-focused)").style("stroke", "var(--cluster-stroke)").style("stroke-width", "3px");
    this.applyClusterStyle(clusterGroup, "var(--cluster-selected-stroke)", "6px");
    setTimeout(() => {
      this.applyClusterStyle(clusterGroup, "var(--cluster-hover-stroke)", "4px");
    }, 200);
  }
  deselectActiveCluster() {
    d3.selectAll(".cluster-bg").each(function() {
      this.blur();
    });
    d3.selectAll(".cluster-bg").classed("cluster-focused", false);
    d3.selectAll(".cluster-bg").classed("cluster-hover-simulated", false);
    d3.selectAll(".cluster-bg").attr("data-selected", "false");
    d3.selectAll(".cluster-bg").style("fill", "var(--cluster-bg)").style("stroke", "var(--cluster-stroke)").style("stroke-width", "3px");
    this.createNodeBlockerOverlay();
    console.log("🔧 [ClusterNav] Cluster deseleccionado, bloqueadores recreados");
  }
  clearClusterSelection() {
    d3.selectAll(".cluster-bg").each(function() {
      this.blur();
    });
    d3.selectAll(".cluster-bg").classed("cluster-focused", false);
    d3.selectAll(".cluster-bg").classed("cluster-hover-simulated", false);
    d3.selectAll(".cluster-bg").attr("data-selected", "false");
    d3.selectAll(".cluster-bg").style("fill", "var(--cluster-bg)").style("stroke", "var(--cluster-stroke)").style("stroke-width", "3px");
    console.log("🔧 [ClusterNav] Selección de clusters limpiada");
  }
  applyClusterStyle(clusterGroup, strokeColor, strokeWidth) {
    const clusterBg = clusterGroup.select(".cluster-bg");
    if (!clusterBg.empty() && clusterBg.attr("data-selected") !== "true") {
      clusterBg.style("stroke", strokeColor).style("stroke-width", strokeWidth);
    }
  }
  applySelectedClusterStyle(clusterGroup) {
    const clusterBg = clusterGroup.select(".cluster-bg");
    if (!clusterBg.empty()) {
      clusterBg.style("fill", "var(--cluster-selected-bg)").style("stroke", "var(--cluster-selected-stroke)").style("stroke-width", "5px");
    }
  }
  // Método para deseleccionar cluster cuando se hace clic fuera
  deselectClusterOnOutsideClick() {
    const selectedCluster = d3.select('.cluster-bg[data-selected="true"]');
    if (!selectedCluster.empty()) {
      this.deselectActiveCluster();
    } else {
      this.createNodeBlockerOverlay();
    }
  }
  // Crear rects SVG invisibles para bloquear nodos en cada cluster
  createNodeBlockerOverlay() {
    d3.selectAll(".cluster-node-blocker").remove();
    const clusters = d3.selectAll(".cluster");
    clusters.each((d, i, nodes) => {
      const cluster = d3.select(nodes[i]);
      const clusterBg = cluster.select(".cluster-bg");
      if (!clusterBg.empty()) {
        const clusterWidth = parseFloat(clusterBg.attr("width"));
        const clusterHeight = parseFloat(clusterBg.attr("height"));
        const blocker = cluster.append("rect").attr("class", "cluster-node-blocker").attr("data-cluster-index", i).attr("x", 0).attr("y", 0).attr("width", clusterWidth).attr("height", clusterHeight).attr("fill", "transparent").attr("stroke", "none").attr("pointer-events", "all").style("cursor", "pointer");
        blocker.on("mouseenter", () => {
          if (clusterBg.attr("data-selected") !== "true") {
            clusterBg.classed("cluster-hover-simulated", true);
          }
        }).on("mouseleave", () => {
          if (clusterBg.attr("data-selected") !== "true") {
            clusterBg.classed("cluster-hover-simulated", false);
          }
        }).on("click", () => {
          this.zoomToCluster(cluster, null, false, true);
          this.removeNodeBlockerOverlay();
        });
      }
    });
    console.log("🔧 [ClusterNav] Rects SVG bloqueadores creados para cada cluster");
  }
  // Remover rects bloqueadores
  removeNodeBlockerOverlay() {
    d3.selectAll(".cluster-node-blocker").remove();
    console.log("🔧 [ClusterNav] Rects SVG bloqueadores removidos");
  }
  // Actualizar posición de los rects bloqueadores cuando cambia el tamaño de la ventana
  updateOverlayPosition() {
    const blockers = d3.selectAll(".cluster-node-blocker");
    if (!blockers.empty()) {
      this.createNodeBlockerOverlay();
    }
  }
}
class XDiagramsNodeNav {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.lastNodeDistance = 0;
    this.isCircularNavigation = false;
  }
  handleTabNavigation() {
    const selectedNodeRect = d3.select(".node-selected");
    if (selectedNodeRect.empty()) {
      return;
    }
    const nodeGroup = d3.select(selectedNodeRect.node().closest(".node"));
    if (nodeGroup.empty()) {
      return;
    }
    const clusterGroup = d3.select(nodeGroup.node().closest(".cluster"));
    if (clusterGroup.empty()) {
      return;
    }
    const allNodes = clusterGroup.selectAll(".node");
    if (allNodes.empty()) {
      return;
    }
    const currentIndex = Array.from(allNodes.nodes()).indexOf(nodeGroup.node());
    const nextIndex = event.shiftKey ? currentIndex <= 0 ? allNodes.size() - 1 : currentIndex - 1 : currentIndex >= allNodes.size() - 1 ? 0 : currentIndex + 1;
    const nextNode = allNodes.nodes()[nextIndex];
    if (!nextNode) {
      return;
    }
    this.selectNode(d3.select(nextNode), false);
  }
  handleNodeArrowNavigation(arrowKey) {
    const selectedNodeRect = d3.select(".node-selected");
    if (selectedNodeRect.empty()) {
      return;
    }
    let nodeGroup = d3.select(selectedNodeRect.node().closest(".node"));
    let isParentNode = false;
    if (nodeGroup.empty()) {
      nodeGroup = d3.select(selectedNodeRect.node().closest(".cluster-bg"));
      if (!nodeGroup.empty()) {
        isParentNode = true;
      }
    } else {
      const nodeElement = nodeGroup.node();
      const nodeData = nodeElement.__data__;
      if (nodeData && (nodeData.parent === null || nodeData.parent === void 0 || nodeData.parent === "")) {
        isParentNode = true;
      }
    }
    if (nodeGroup.empty()) {
      return;
    }
    const clusterGroup = d3.select(nodeGroup.node().closest(".cluster"));
    if (clusterGroup.empty()) {
      return;
    }
    const allNodes = isParentNode ? clusterGroup.selectAll(".node, .cluster-bg") : clusterGroup.selectAll(".node");
    if (allNodes.empty()) {
      return;
    }
    const currentIndex = Array.from(allNodes.nodes()).indexOf(nodeGroup.node());
    let nextIndex;
    switch (arrowKey) {
      case "ArrowUp":
        nextIndex = this.getPreviousNodeInColumn(currentIndex, allNodes, isParentNode);
        break;
      case "ArrowDown":
        nextIndex = this.getNextNodeInColumn(currentIndex, allNodes, isParentNode);
        break;
      case "ArrowLeft":
        nextIndex = this.getPreviousNodeInRow(currentIndex, allNodes);
        break;
      case "ArrowRight":
        nextIndex = this.getNextNodeInRow(currentIndex, allNodes);
        break;
      default:
        return;
    }
    const nextNode = allNodes.nodes()[nextIndex];
    if (!nextNode) {
      return;
    }
    this.selectNode(d3.select(nextNode), false);
  }
  selectNode(nodeGroup, isClickNavigation = false) {
    let distanceFromPrevious = 0;
    if (!isClickNavigation) {
      const previousSelectedNode = d3.select(".node-selected");
      if (!previousSelectedNode.empty()) {
        const previousNodeGroup = d3.select(previousSelectedNode.node().closest(".node"));
        if (!previousNodeGroup.empty()) {
          const previousRect = previousNodeGroup.node().getBoundingClientRect();
          const currentRect = nodeGroup.node().getBoundingClientRect();
          const previousCenterX = previousRect.left + previousRect.width / 2;
          const previousCenterY = previousRect.top + previousRect.height / 2;
          const currentCenterX = currentRect.left + currentRect.width / 2;
          const currentCenterY = currentRect.top + currentRect.height / 2;
          const deltaX = currentCenterX - previousCenterX;
          const deltaY = currentCenterY - previousCenterY;
          distanceFromPrevious = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
      }
    }
    d3.selectAll(".node-selected").classed("node-selected", false);
    nodeGroup.classed("node-selected", true);
    const rect = nodeGroup.select("rect");
    rect.style("stroke-linejoin", "round");
    this.ensureNodeVisibleWithTransition(nodeGroup);
    const nodeElement = nodeGroup.node();
    const nodeData = nodeElement.__data__;
    if (nodeData) {
      const dataPayload = nodeData.data?.data || nodeData.data || {};
      this.core.uiManager.openInfoPanel(dataPayload, this.core.config);
    } else {
      const nodeId = nodeElement.querySelector(".node-id-label")?.textContent;
      if (nodeId) {
        const dataPayload = { id: nodeId };
        this.core.uiManager.openInfoPanel(dataPayload, this.core.config);
      }
    }
    this.lastNodeDistance = distanceFromPrevious;
    this.isCircularNavigation = distanceFromPrevious > 500;
  }
  exitNodeNavigationMode(fromInfoPanel = false) {
    const selectedNode = d3.select(".node-selected");
    let parentClusterGroup = null;
    if (!selectedNode.empty()) {
      const nodeElement = selectedNode.node();
      const clusterElement = nodeElement.closest(".cluster");
      if (clusterElement) {
        parentClusterGroup = d3.select(clusterElement);
      }
    }
    if (!fromInfoPanel) {
      if (this.core.uiManager.isInfoPanelClosing)
        ;
      else {
        this.core.uiManager.closeInfoPanel();
      }
    } else {
      if (this.core.uiManager.isInfoPanelClosing)
        ;
      else {
        this.core.uiManager.closeInfoPanel();
      }
    }
    d3.selectAll(".node-selected").classed("node-selected", false);
    if (parentClusterGroup) {
      try {
        this.navigation.clusterNavInstance.zoomToCluster(parentClusterGroup, this.core.globalContainer, false, true);
      } catch (error) {
        console.error("Error calling zoomToCluster from exitNodeNavigationMode:", error);
      }
    }
  }
  selectFirstNodeInCluster(clusterGroup) {
    const cluster = d3.select(clusterGroup.node().closest(".cluster"));
    if (cluster.empty()) {
      return;
    }
    const allNodes = cluster.selectAll(".node");
    if (allNodes.empty()) {
      return;
    }
    const firstNode = allNodes.nodes()[0];
    if (firstNode) {
      this.selectNode(d3.select(firstNode), false);
      const nodeData = firstNode.__data__;
      if (nodeData) {
        this.core.diagramRenderer.zoomToNode(d3.select(firstNode), nodeData, true);
      }
    }
  }
  ensureNodeVisible(nodeGroup) {
    const svg = d3.select("#diagram");
    if (svg.empty())
      return;
    const svgNode2 = svg.node();
    const svgRect = svgNode2.getBoundingClientRect();
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    const currentTransform = d3.zoomTransform(svgNode2);
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    const viewportWidth = svgRect.width;
    const viewportHeight = svgRect.height;
    const infoPanel = document.getElementById("side-panel");
    let infoPanelWidth = 0;
    if (infoPanel && infoPanel.style.display !== "none") {
      const panelRect = infoPanel.getBoundingClientRect();
      infoPanelWidth = panelRect.width;
    }
    const availableViewportWidth = viewportWidth - infoPanelWidth;
    const marginX = availableViewportWidth * 0.2;
    const marginY = viewportHeight * 0.2;
    const viewportLeft = -currentTransform.x / currentTransform.k;
    const viewportRight = viewportLeft + availableViewportWidth / currentTransform.k;
    const viewportTop = -currentTransform.y / currentTransform.k;
    const viewportBottom = viewportTop + viewportHeight / currentTransform.k;
    let newX = currentTransform.x;
    let newY = currentTransform.y;
    let needsPan = false;
    if (diagramX < viewportLeft + marginX) {
      newX = -(diagramX - marginX) * currentTransform.k;
      needsPan = true;
    } else if (diagramX > viewportRight - marginX) {
      newX = -(diagramX + marginX - availableViewportWidth / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    if (diagramY < viewportTop + marginY) {
      newY = -(diagramY - marginY) * currentTransform.k;
      needsPan = true;
    } else if (diagramY > viewportBottom - marginY) {
      newY = -(diagramY + marginY - viewportHeight / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    if (needsPan) {
      const newTransform = d3.zoomIdentity.translate(newX, newY).scale(currentTransform.k);
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, 300);
      } else {
        svg.transition().duration(300).ease(d3.easeCubicOut).call(d3.zoom().transform, newTransform);
      }
    }
  }
  ensureNodeVisibleWithTransition(nodeGroup) {
    const svg = d3.select("#diagram");
    if (svg.empty())
      return;
    const svgNode2 = svg.node();
    const svgRect = svgNode2.getBoundingClientRect();
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    const currentTransform = d3.zoomTransform(svgNode2);
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    const viewportWidth = svgRect.width;
    const viewportHeight = svgRect.height;
    const infoPanel = document.getElementById("side-panel");
    let infoPanelWidth = 0;
    if (infoPanel && infoPanel.style.display !== "none") {
      const panelRect = infoPanel.getBoundingClientRect();
      infoPanelWidth = panelRect.width;
    }
    const availableViewportWidth = viewportWidth - infoPanelWidth;
    const marginX = availableViewportWidth * 0.2;
    const marginY = viewportHeight * 0.2;
    const viewportLeft = -currentTransform.x / currentTransform.k;
    const viewportRight = viewportLeft + availableViewportWidth / currentTransform.k;
    const viewportTop = -currentTransform.y / currentTransform.k;
    const viewportBottom = viewportTop + viewportHeight / currentTransform.k;
    let newX = currentTransform.x;
    let newY = currentTransform.y;
    let needsPan = false;
    if (diagramX < viewportLeft + marginX) {
      newX = -(diagramX - marginX) * currentTransform.k;
      needsPan = true;
    } else if (diagramX > viewportRight - marginX) {
      newX = -(diagramX + marginX - availableViewportWidth / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    if (diagramY < viewportTop + marginY) {
      newY = -(diagramY - marginY) * currentTransform.k;
      needsPan = true;
    } else if (diagramY > viewportBottom - marginY) {
      newY = -(diagramY + marginY - viewportHeight / currentTransform.k) * currentTransform.k;
      needsPan = true;
    }
    if (needsPan) {
      const distanceX = Math.abs(newX - currentTransform.x);
      const distanceY = Math.abs(newY - currentTransform.y);
      const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      let baseDuration, maxDuration;
      if (this.isCircularNavigation) {
        baseDuration = 800;
        maxDuration = 2500;
      } else {
        baseDuration = 300;
        maxDuration = 1500;
      }
      const distanceFactor = Math.min(totalDistance / 1e3, 1);
      const duration = baseDuration + (maxDuration - baseDuration) * distanceFactor;
      const newTransform = d3.zoomIdentity.translate(newX, newY).scale(currentTransform.k);
      if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
        this.core.navigation.zoomManagerInstance.zoomTo(newTransform, duration);
      } else {
        svg.transition().duration(duration).ease(d3.easeCubicOut).call(d3.zoom().transform, newTransform);
      }
    }
  }
  getPreviousNodeInRow(currentIndex, allNodes) {
    return this._findNodeInRow(currentIndex, allNodes, "previous");
  }
  getNextNodeInRow(currentIndex, allNodes) {
    return this._findNodeInRow(currentIndex, allNodes, "next");
  }
  getPreviousNodeInColumn(currentIndex, allNodes, isParentNode = false) {
    return this._findNodeInColumn(currentIndex, allNodes, "previous", isParentNode);
  }
  getNextNodeInColumn(currentIndex, allNodes, isParentNode = false) {
    return this._findNodeInColumn(currentIndex, allNodes, "next", isParentNode);
  }
  _findNodeInRow(currentIndex, allNodes, direction) {
    const nodes = allNodes.nodes();
    const currentNode = nodes[currentIndex];
    if (!currentNode)
      return currentIndex;
    const currentRect = currentNode.getBoundingClientRect();
    const currentY = currentRect.top + currentRect.height / 2;
    const tolerance = 20;
    let bestIndex = currentIndex;
    let bestDistance = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (i === currentIndex)
        continue;
      const nodeRect = nodes[i].getBoundingClientRect();
      const nodeY = nodeRect.top + nodeRect.height / 2;
      if (Math.abs(nodeY - currentY) <= tolerance) {
        const distance = nodeRect.left - currentRect.left;
        if (direction === "next" && distance > 0 && distance < bestDistance) {
          bestIndex = i;
          bestDistance = distance;
        } else if (direction === "previous" && distance < 0 && Math.abs(distance) < bestDistance) {
          bestIndex = i;
          bestDistance = Math.abs(distance);
        }
      }
    }
    if (bestIndex === currentIndex) {
      const sameRowNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === currentIndex)
          continue;
        const nodeRect = nodes[i].getBoundingClientRect();
        const nodeY = nodeRect.top + nodeRect.height / 2;
        if (Math.abs(nodeY - currentY) <= tolerance) {
          sameRowNodes.push({
            index: i,
            x: nodeRect.left,
            distance: nodeRect.left - currentRect.left
          });
        }
      }
      if (sameRowNodes.length > 0) {
        sameRowNodes.sort((a, b) => a.x - b.x);
        if (direction === "next") {
          bestIndex = sameRowNodes[0].index;
        } else {
          bestIndex = sameRowNodes[sameRowNodes.length - 1].index;
        }
      }
    }
    return bestIndex;
  }
  _findNodeInColumn(currentIndex, allNodes, direction, isParentNode = false) {
    const nodes = allNodes.nodes();
    const currentNode = nodes[currentIndex];
    if (!currentNode)
      return currentIndex;
    const currentRect = currentNode.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top + currentRect.height / 2;
    const horizontalTolerance = 50;
    const candidates = [];
    for (let i = 0; i < nodes.length; i++) {
      if (i === currentIndex)
        continue;
      const nodeRect = nodes[i].getBoundingClientRect();
      const nodeX = nodeRect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top + nodeRect.height / 2;
      const verticalDistance = nodeY - currentY;
      if (direction === "next" && verticalDistance > 0 || direction === "previous" && verticalDistance < 0) {
        const horizontalDistance = Math.abs(nodeX - currentX);
        const isCandidateNode = isParentNode ? !nodes[i].classList.contains("cluster-bg") : true;
        if (horizontalDistance <= horizontalTolerance && isCandidateNode) {
          candidates.push({
            index: i,
            verticalDistance: Math.abs(verticalDistance),
            horizontalDistance,
            node: nodes[i],
            nodeY
          });
        }
      }
    }
    if (candidates.length === 0) {
      for (let i = 0; i < nodes.length; i++) {
        if (i === currentIndex)
          continue;
        const nodeRect = nodes[i].getBoundingClientRect();
        const nodeY = nodeRect.top + nodeRect.height / 2;
        const verticalDistance = nodeY - currentY;
        if (direction === "next" && verticalDistance > 0 || direction === "previous" && verticalDistance < 0) {
          const isCandidateNode = isParentNode ? !nodes[i].classList.contains("cluster-bg") : true;
          if (isCandidateNode) {
            candidates.push({
              index: i,
              verticalDistance: Math.abs(verticalDistance),
              horizontalDistance: Math.abs(nodeRect.left + nodeRect.width / 2 - currentX),
              node: nodes[i],
              nodeY
            });
          }
        }
      }
    }
    if (candidates.length === 0) {
      if (isParentNode) {
        return currentIndex;
      } else {
        const allChildNodes = [];
        for (let i = 0; i < nodes.length; i++) {
          if (i === currentIndex)
            continue;
          if (!nodes[i].classList.contains("cluster-bg")) {
            const nodeRect = nodes[i].getBoundingClientRect();
            const nodeY = nodeRect.top + nodeRect.height / 2;
            const nodeX = nodeRect.left + nodeRect.width / 2;
            allChildNodes.push({
              index: i,
              y: nodeY,
              x: nodeX,
              verticalDistance: nodeY - currentY
            });
          }
        }
        if (allChildNodes.length > 0) {
          allChildNodes.sort((a, b) => a.y - b.y);
          let bestIndex2;
          if (direction === "next") {
            bestIndex2 = allChildNodes[0].index;
          } else {
            bestIndex2 = allChildNodes[allChildNodes.length - 1].index;
          }
          return bestIndex2;
        } else {
          return currentIndex;
        }
      }
    }
    const levelGroups = /* @__PURE__ */ new Map();
    const levelTolerance = 20;
    for (const candidate of candidates) {
      let grouped = false;
      for (const [levelY, group] of levelGroups) {
        if (Math.abs(candidate.nodeY - levelY) <= levelTolerance) {
          group.push(candidate);
          grouped = true;
          break;
        }
      }
      if (!grouped) {
        levelGroups.set(candidate.nodeY, [candidate]);
      }
    }
    const sortedLevels = Array.from(levelGroups.entries()).sort(([levelY1], [levelY2]) => {
      const distance1 = Math.abs(levelY1 - currentY);
      const distance2 = Math.abs(levelY2 - currentY);
      return distance1 - distance2;
    });
    if (sortedLevels.length === 0) {
      return currentIndex;
    }
    const [closestLevelY, levelCandidates] = sortedLevels[0];
    let bestIndex = currentIndex;
    let bestHorizontalDistance = Infinity;
    for (const candidate of levelCandidates) {
      if (candidate.horizontalDistance < bestHorizontalDistance) {
        bestIndex = candidate.index;
        bestHorizontalDistance = candidate.horizontalDistance;
      }
    }
    return bestIndex;
  }
}
class XDiagramsResizeHandler {
  constructor(navigation) {
    this.navigation = navigation;
    this.core = navigation.core;
    this.resizeHandler = null;
  }
  setup() {
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    this.resizeHandler = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const widthChange = Math.abs(currentWidth - lastWidth);
      const heightChange = Math.abs(currentHeight - lastHeight);
      const isSignificantChange = widthChange > 10 || heightChange > 10;
      const svg = d3.select("#diagram");
      if (!svg.empty()) {
        svg.attr("width", currentWidth).attr("height", currentHeight);
        if (this.core.config.fitOnResize && this.core.globalContainer && this.core.globalTrees) {
          const bounds = this.core.calculateDiagramBounds();
          this.core.applyInitialZoomImmediate(this.core.globalContainer, bounds.width, bounds.height);
        } else if (isSignificantChange && this.core.globalContainer && this.core.globalTrees) {
          const currentZoom = this.core.navigation?.zoomManagerInstance?.getCurrentZoom() || 1;
          const zoomThreshold = 0.2;
          if (currentZoom <= zoomThreshold) {
            const bounds = this.core.calculateDiagramBounds();
            this.core.applyInitialZoomImmediate(this.core.globalContainer, bounds.width, bounds.height);
          }
        }
      }
      lastWidth = currentWidth;
      lastHeight = currentHeight;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
      }, 100);
    };
    window.addEventListener("resize", this.resizeHandler);
  }
  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
  }
}
class XDiagramsEventHandler {
  constructor() {
    this.setupEventListeners();
  }
  /**
   * Configura los event listeners necesarios
   */
  setupEventListeners() {
    try {
      window.addEventListener("xdiagrams:infopanel:close", () => {
        this.handleInfoPanelClose();
      });
    } catch (error) {
      console.warn("Error setting up infopanel close listener:", error);
    }
  }
  /**
   * Maneja el evento de cierre del InfoPanel
   */
  handleInfoPanelClose() {
    try {
      d3.selectAll(".node rect").classed("node-selected", false).style("stroke", null).style("stroke-width", null);
    } catch (error) {
      console.warn("Error handling infopanel close:", error);
    }
  }
  /**
   * Limpia los event listeners
   */
  destroy() {
    try {
      window.removeEventListener("xdiagrams:infopanel:close", this.handleInfoPanelClose);
    } catch (error) {
      console.warn("Error removing event listeners:", error);
    }
  }
}
class XDiagramsNavigation {
  constructor(core) {
    this.core = core;
    this.escapeLevel = 0;
    this.zoomManager = new XDiagramsZoomManager();
    this.zoomControls = new XDiagramsZoomControls(this);
    this.keyboardNav = new XDiagramsKeyboardNav(this);
    this.clusterNav = new XDiagramsClusterNav(this);
    this.nodeNav = new XDiagramsNodeNav(this);
    this.resizeHandler = new XDiagramsResizeHandler(this);
    this.eventHandler = new XDiagramsEventHandler();
  }
  // Métodos de coordinación esencial
  createZoomControls() {
    return this.zoomControls.create();
  }
  setupKeyboardNavigation(container) {
    return this.keyboardNav.setup(container);
  }
  setupResizeHandler() {
    return this.resizeHandler.setup();
  }
  destroyZoomControls() {
    this.keyboardNav.destroy();
    this.resizeHandler.destroy();
    this.zoomControls.destroy();
    this.eventHandler.destroy();
  }
  // Método delegado del zoom manager
  getCurrentZoom() {
    return this.zoomManager.getCurrentZoom();
  }
  // Acceso directo a los submódulos para casos específicos
  get zoomManagerInstance() {
    return this.zoomManager;
  }
  get zoomControlsInstance() {
    return this.zoomControls;
  }
  get keyboardNavInstance() {
    return this.keyboardNav;
  }
  get clusterNavInstance() {
    return this.clusterNav;
  }
  get nodeNavInstance() {
    return this.nodeNav;
  }
  get resizeHandlerInstance() {
    return this.resizeHandler;
  }
  // Getters para propiedades de navegación
  get lastNodeDistance() {
    return this.nodeNav.lastNodeDistance;
  }
  get isCircularNavigation() {
    return this.nodeNav.isCircularNavigation;
  }
}
class XDiagramsLoadingManager {
  constructor() {
    this.isLoading = false;
    this.loadingContainer = null;
  }
  createLoading() {
    const app = document.querySelector("#app");
    if (!app)
      return;
    document.getElementById("loading-container")?.remove();
    const loadingContainer = document.createElement("div");
    loadingContainer.id = "loading-container";
    loadingContainer.style.cssText = `
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 9999; opacity: 1; transition: opacity 0.5s ease-in-out; pointer-events: none;
    `;
    const spinner = document.createElement("div");
    spinner.style.cssText = `
      width: 50px; height: 50px; border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid var(--loading-color); border-radius: 50%; animation: spin 1s linear infinite;
    `;
    if (!document.querySelector("#loading-animation")) {
      const animationStyle = document.createElement("style");
      animationStyle.id = "loading-animation";
      animationStyle.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(animationStyle);
    }
    loadingContainer.appendChild(spinner);
    app.appendChild(loadingContainer);
    this.loadingContainer = loadingContainer;
  }
  show() {
    this.isLoading = true;
    this.createLoading();
    const diagram = document.getElementById("diagram");
    if (diagram) {
      diagram.style.setProperty("opacity", "0");
    }
  }
  hide() {
    this.isLoading = false;
    if (this.loadingContainer) {
      this.loadingContainer.style.opacity = "0";
      setTimeout(() => {
        if (this.loadingContainer && this.loadingContainer.parentNode) {
          this.loadingContainer.remove();
        }
      }, 500);
    }
  }
  getLoadingState() {
    return {
      isLoading: this.isLoading,
      loadingContainer: this.loadingContainer
    };
  }
}
class XDiagramsErrorManager {
  constructor() {
    this.errorContainer = null;
  }
  showError(error) {
    if (this.isSimpleError(error)) {
      this.showSimpleError("No se ha encontrado el archivo de datos");
      return;
    }
    const errorContainer = document.createElement("div");
    errorContainer.id = "xdiagrams-error";
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc3545;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 500px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      text-align: center;
    `;
    const title = document.createElement("h3");
    title.textContent = "Error al cargar el diagrama";
    title.style.cssText = "margin: 0 0 15px 0; font-size: 18px;";
    errorContainer.appendChild(title);
    const message = document.createElement("p");
    message.textContent = error.message || "Error desconocido al cargar los datos";
    message.style.cssText = "margin: 0 0 15px 0; line-height: 1.4;";
    errorContainer.appendChild(message);
    const retryButton = document.createElement("button");
    retryButton.textContent = "Reintentar";
    retryButton.style.cssText = `
      background: white;
      color: #dc3545;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 10px;
    `;
    retryButton.onclick = () => {
      errorContainer.remove();
      window.dispatchEvent(new CustomEvent("xdiagrams-retry"));
    };
    const closeButton = document.createElement("button");
    closeButton.textContent = "Cerrar";
    closeButton.style.cssText = `
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeButton.onclick = () => {
      errorContainer.remove();
    };
    const buttonContainer = document.createElement("div");
    buttonContainer.appendChild(retryButton);
    buttonContainer.appendChild(closeButton);
    errorContainer.appendChild(buttonContainer);
    document.body.appendChild(errorContainer);
    this.errorContainer = errorContainer;
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 3e4);
  }
  showSimpleError(message) {
    const existingError = document.getElementById("xdiagrams-simple-error");
    if (existingError) {
      existingError.remove();
    }
    const errorContainer = document.createElement("div");
    errorContainer.id = "xdiagrams-simple-error";
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      opacity: 0.5;
      font-family: Arial, sans-serif;
      font-size: 18px;
      z-index: 10000;
      text-align: center;
      max-width: 400px;
      line-height: 1.4;
    `;
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.style.cssText = "margin: 0;";
    errorContainer.appendChild(messageElement);
    document.body.appendChild(errorContainer);
    this.errorContainer = errorContainer;
  }
  isSimpleError(error) {
    const simpleErrorPatterns = [
      "404",
      "No se pudo cargar",
      "Failed to fetch",
      "ERR_CONNECTION_CLOSED",
      "Error cargando archivo CSV",
      "No se pudo determinar el tipo de fuente",
      "URL o formato no reconocido"
    ];
    return simpleErrorPatterns.some(
      (pattern) => error.message && error.message.includes(pattern)
    );
  }
  clearError() {
    if (this.errorContainer && this.errorContainer.parentNode) {
      this.errorContainer.remove();
      this.errorContainer = null;
    }
  }
}
class XDiagramsNotificationManager {
  constructor() {
    this.notifications = /* @__PURE__ */ new Map();
  }
  showCacheCleared() {
    const notification = document.createElement("div");
    notification.id = "cache-notification";
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #000; color: white;
      padding: 12px 20px; border-radius: 6px; font-family: Arial, sans-serif;
      font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0; transform: translateX(100%); transition: all 0.3s ease;
    `;
    notification.textContent = "Cache limpiado - Recargando datos...";
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.cssText += "opacity: 1; transform: translateX(0);";
    }, 100);
    setTimeout(() => {
      notification.style.cssText += "opacity: 0; transform: translateX(100%);";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3e3);
    this.notifications.set("cache-cleared", notification);
  }
  showNotification(message, type = "info", duration = 3e3) {
    const notification = document.createElement("div");
    const notificationId = `notification-${Date.now()}`;
    notification.id = notificationId;
    const bgColor = this.getBackgroundColor(type);
    const icon = this.getIcon(type);
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: ${bgColor}; color: white;
      padding: 12px 20px; border-radius: 6px; font-family: Arial, sans-serif;
      font-size: 14px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0; transform: translateX(100%); transition: all 0.3s ease;
      display: flex; align-items: center; gap: 8px;
    `;
    notification.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.cssText += "opacity: 1; transform: translateX(0);";
    }, 100);
    setTimeout(() => {
      notification.style.cssText += "opacity: 0; transform: translateX(100%);";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
        this.notifications.delete(notificationId);
      }, 300);
    }, duration);
    this.notifications.set(notificationId, notification);
  }
  getBackgroundColor(type) {
    const colors = {
      "info": "#007bff",
      "success": "#28a745",
      "warning": "#ffc107",
      "error": "#dc3545"
    };
    return colors[type] || colors.info;
  }
  getIcon(type) {
    const icons = {
      "info": "ℹ️",
      "success": "✅",
      "warning": "⚠️",
      "error": "❌"
    };
    return icons[type] || icons.info;
  }
  clearAllNotifications() {
    this.notifications.forEach((notification) => {
      if (notification.parentNode) {
        notification.remove();
      }
    });
    this.notifications.clear();
  }
  clearNotification(id2) {
    const notification = this.notifications.get(id2);
    if (notification && notification.parentNode) {
      notification.remove();
      this.notifications.delete(id2);
    }
  }
}
const d3$1 = window.d3;
class XDiagramsInfoPanel {
  constructor(options = {}) {
    this.options = {
      panelId: "side-panel",
      ...options
    };
    this.isClosing = false;
    this.infoPanelElements = /* @__PURE__ */ new Map();
    this.ensureStylesInjected();
    this.ensurePanel();
  }
  // ===== GESTIÓN DEL PANEL =====
  ensureStylesInjected() {
    if (document.getElementById("xdiagrams-infopanel-styles"))
      return;
    const style = document.createElement("style");
    style.id = "xdiagrams-infopanel-styles";
    style.textContent = `
      .side-panel { 
        position: fixed; 
        top: 0; 
        right: 0; 
        width: 360px; 
        height: 100%;
        background: var(--ui-panel-bg); 
        color: var(--ui-panel-text); 
        box-shadow: var(--side-panel-shadow);
        z-index: 10050; 
        transform: translateX(100%); 
        transition: transform var(--transition-normal);
      }
      .side-panel.open { transform: translateX(0); }
      
      .side-panel-header { 
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        padding: 28px 20px 24px; 
        border-bottom: 1px solid var(--ui-panel-border); 
      }
      
      .side-panel-title { 
        margin: 0; 
        font-size: 18px; 
        font-weight: 600; 
        display: flex; 
        gap: 16px; 
        align-items: flex-start; 
        flex: 1;
        min-width: 0;
        position: relative;
      }
      

      
      .side-panel-title-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
      }
      
      .side-panel-title-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .side-panel-title-id {
        font-size: 11px;
        color: var(--ui-panel-text-muted);
        font-weight: normal;
        opacity: 0.8;
      }
      
      .side-panel-title-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .side-panel-title-thumbnail {
        width: 36px;
        height: 36px;
        object-fit: contain;
        flex-shrink: 0;
        border-radius: 8px;
        background: var(--ui-control-bg);
        border: 1px solid var(--ui-control-border);
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 2px;
      }
      
      .side-panel-title-thumbnail.embedded-thumbnail {
        background: transparent;
        border: none;
      }
      
      .side-panel-title-thumbnail.custom-image {
        border-radius: 6px;
      }
      
      .side-panel-title-thumbnail .detail:before {
        content: "\\e900";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .document:before {
        content: "\\e901";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .form:before {
        content: "\\e934";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .grid:before {
        content: "\\e938";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .home:before {
        content: "\\e939";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .list:before {
        content: "\\e93b";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .modal:before {
        content: "\\e93c";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .profile:before {
        content: "\\e941";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .report:before {
        content: "\\e942";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-title-thumbnail .settings:before {
        content: "\\e943";
        font-family: 'xdiagrams-icons';
      }
      
      .side-panel-close { 
        cursor: pointer; 
        font-size: 24px; 
        line-height: 1; 
        opacity: .8; 
        color: var(--ui-panel-text);
        transition: opacity var(--transition-fast);
      }
      .side-panel-close:hover { opacity: 1; }
      
      .side-panel-id-tag { 
        padding: 6px 16px; 
        font-size: 12px; 
        opacity: .8; 
        color: var(--ui-panel-text-muted);
      }
      
      .side-panel-content { 
        padding: 20px 32px 28px; 
        overflow: auto; 
        height: calc(100% - 92px); 
      }
      
      .side-panel-fields-table { 
        display: grid; 
        grid-template-columns: 1fr; 
        gap: 10px; 
      }
      
      .side-panel-field { 
        display: grid; 
        grid-template-columns: 30% 70%; 
        gap: 8px; 
        align-items: start; 
      }
      
      .side-panel-label { 
        color: var(--ui-panel-text-muted); 
        font-size: 12px; 
      }
      
      .side-panel-value { 
        color: var(--ui-panel-text); 
        font-size: 12px; 
        word-break: break-word; 
      }
      
      .side-panel-value.empty { 
        opacity: .5; 
        font-style: italic; 
      }
      
      .side-panel-url-link {
        color: var(--ui-focus);
        text-decoration: none;
        transition: color var(--transition-fast);
      }
      
      .side-panel-url-link:hover {
        text-decoration: underline;
      }
      
      /* ===== SECCIÓN DE URL ===== */
      .side-panel-url-section {
        padding: 16px 20px;
        border-bottom: 1px solid var(--ui-panel-border);
        background: var(--ui-panel-bg);
      }
      
      .side-panel-url-input-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .side-panel-url-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--ui-panel-border);
        border-radius: 4px;
        background: var(--ui-panel-bg);
        color: var(--ui-panel-text-muted);
        font-size: 10px;
        font-family: monospace;
        outline: none;
        transition: border-color var(--transition-fast);
        opacity: 0.7;
      }
      
      .side-panel-url-input:focus {
        opacity: 1;
      }
      
      .side-panel-url-input:read-only {
        background: var(--ui-panel-bg-muted);
        color: var(--ui-panel-text-muted);
        cursor: default;
      }
      
      .side-panel-url-button {
        background: hsl(var(--color-base) 15% / 1);
        border: none;
        border-radius: 50%;
        color: var(--ui-panel-text);
        font-size: 14px;
        font-weight: bold;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        user-select: none;
      }
      
      .side-panel-url-button:hover {
        background: hsl(var(--color-base) 10% / 1);
        transform: scale(1.05);
      }
      
      .side-panel-url-button:active {
        background: hsl(var(--color-base) 10% / 1);
        transform: scale(0.95);
      }
      
      .side-panel-url-button-icon {
        width: 14px;
        height: 14px;
        color: currentColor;
        display: block;
      }
      
      /* ===== BOTÓN DE COLAPSAR ===== */
      .side-panel-collapse-btn {
        position: fixed;
        bottom: 12px;
        right: 318px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--ui-control-text);
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 10051;
      }
      
      .side-panel-collapse-btn:hover {
        background: var(--ui-control-bg-hover);
        transform: scale(1.05);
      }
      
      .side-panel-collapse-btn:active {
        background: var(--ui-control-bg-active);
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
  }
  ensurePanel() {
    if (document.getElementById(this.options.panelId))
      return;
    const panel = document.createElement("div");
    panel.className = "side-panel";
    panel.id = this.options.panelId;
    panel.innerHTML = `
      <div class="side-panel-header">
        <h3 class="side-panel-title" id="side-panel-title">
          <span class="side-panel-title-thumbnail" id="side-panel-thumbnail"></span>
          <div class="side-panel-title-content">
            <span class="side-panel-title-text" id="side-panel-title-text">Detalles del Nodo</span>
            <span class="side-panel-title-id" id="side-panel-title-id"></span>
          </div>
        </h3>
      </div>
      <div class="side-panel-url-section" id="side-panel-url-section" style="display: none;">
        <div class="side-panel-url-input-container">
          <input type="text" class="side-panel-url-input" id="side-panel-url-input" placeholder="URL del nodo" readonly>
          <button class="side-panel-url-button" id="side-panel-url-button" type="button">
            <svg class="side-panel-url-button-icon" width="14" height="14" viewBox="0 0 640 640" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M384 64C366.3 64 352 78.3 352 96C352 113.7 366.3 128 384 128L466.7 128L265.3 329.4C252.8 341.9 252.8 362.2 265.3 374.7C277.8 387.2 298.1 387.2 310.6 374.7L512 173.3L512 256C512 273.7 526.3 288 544 288C561.7 288 576 273.7 576 256L576 96C576 78.3 561.7 64 544 64L384 64zM144 160C99.8 160 64 195.8 64 240L64 496C64 540.2 99.8 576 144 576L400 576C444.2 576 480 540.2 480 496L480 416C480 398.3 465.7 384 448 384C430.3 384 416 398.3 416 416L416 496C416 504.8 408.8 512 400 512L144 512C135.2 512 128 504.8 128 496L128 240C128 231.2 135.2 224 144 224L224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160L144 160z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="side-panel-content" id="side-panel-content"></div>
      <button class="side-panel-collapse-btn" id="side-panel-collapse-btn" type="button" aria-label="Colapsar panel">
        <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.7695 19.0498C13.7273 19.425 13.7305 19.8043 13.7812 20.1787H8.56445C8.25269 20.1786 8 19.926 8 19.6143C8.00008 19.3025 8.25274 19.0499 8.56445 19.0498H13.7695ZM18.7002 19.96C18.4806 20.1796 18.125 20.1795 17.9053 19.96C17.6856 19.7403 17.6856 19.3847 17.9053 19.165L18.0205 19.0498H19.6104L18.7002 19.96ZM16.3506 15.0625L15.751 15.6621H8.56445C8.25269 15.662 8 15.4085 8 15.0967C8.00023 14.7851 8.25284 14.5323 8.56445 14.5322H15.8203L16.3506 15.0625ZM13.7734 10.0156C13.7283 10.3906 13.7295 10.7699 13.7773 11.1445H8.56445C8.25279 11.1444 8.00015 10.8917 8 10.5801C8 10.2683 8.25269 10.0157 8.56445 10.0156H13.7734ZM18.4268 10.0156C18.5267 10.0383 18.6223 10.0872 18.7002 10.165L19.6797 11.1445H18.0898L17.9053 10.96C17.6856 10.7403 17.6856 10.3847 17.9053 10.165C17.9833 10.0871 18.0786 10.0382 18.1787 10.0156H18.4268Z" fill="currentColor"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M17.905 10.1648C17.6853 10.3844 17.6853 10.7406 17.905 10.9602L22.0072 15.0625L17.905 19.1648C17.6853 19.3844 17.6853 19.7406 17.905 19.9602C18.1247 20.1799 18.4808 20.1799 18.7005 19.9602L23.2005 15.4602C23.4202 15.2406 23.4202 14.8844 23.2005 14.6648L18.7005 10.1648C18.4808 9.94508 18.1247 9.94508 17.905 10.1648Z" fill="currentColor"/>
        </svg>
      </button>
    `;
    document.body.appendChild(panel);
    panel.querySelector("#side-panel-collapse-btn")?.addEventListener("click", () => this.close());
  }
  async open(nodeData, diagramConfig = {}) {
    this.ensurePanel();
    const panel = document.getElementById(this.options.panelId);
    const content = document.getElementById("side-panel-content");
    const titleEl = document.getElementById("side-panel-title-text");
    const titleIdEl = document.getElementById("side-panel-title-id");
    const thumbnailEl = document.getElementById("side-panel-thumbnail");
    const urlSection = document.getElementById("side-panel-url-section");
    const urlInput = document.getElementById("side-panel-url-input");
    const urlButton = document.getElementById("side-panel-url-button");
    if (!panel || !content || !titleEl || !titleIdEl || !thumbnailEl)
      return;
    const title = nodeData?.name || nodeData?.Name || nodeData.data && nodeData.data.name || nodeData.data && nodeData.data.Name || nodeData?.title || "Nodo";
    const nodeIdValue = nodeData?.id ?? nodeData?.ID ?? nodeData?.Node ?? (nodeData.data && nodeData.data.id) ?? (nodeData.data && nodeData.data.ID) ?? (nodeData.data && nodeData.data.Node) ?? "";
    console.log("[InfoPanel] nodeData:", JSON.stringify(nodeData, null, 2));
    titleEl.textContent = String(title);
    titleIdEl.textContent = nodeIdValue || "";
    const url = this.findUrl(nodeData);
    console.log("[InfoPanel] URL encontrada:", url);
    if (url && urlSection && urlInput) {
      urlInput.value = url;
      urlSection.style.display = "block";
      if (urlButton) {
        urlButton.onclick = () => {
          window.open(url, "_blank", "noopener,noreferrer");
        };
      }
    } else if (urlSection) {
      urlSection.style.display = "none";
    }
    await this.createThumbnail(thumbnailEl, nodeData, diagramConfig);
    content.innerHTML = await this.buildFieldsHtml(nodeData, diagramConfig);
    panel.classList.add("open");
    try {
      window.dispatchEvent(new CustomEvent("xdiagrams:infopanel:open"));
    } catch (_) {
    }
  }
  async createThumbnail(thumbnailEl, nodeData, diagramConfig = {}) {
    try {
      const imgVal = nodeData.img || nodeData.data && nodeData.data.img || "";
      if (imgVal && imgVal.trim() !== "") {
        thumbnailEl.innerHTML = `<img src="${imgVal}" class="custom-image" width="36" height="36" style="opacity: 1; transition: opacity 0.2s ease-in-out;" onerror="this.style.display='none'">`;
        return;
      }
      const defaultIcon = this.getDefaultIcon(nodeData, diagramConfig);
      thumbnailEl.innerHTML = defaultIcon;
    } catch (error) {
      console.error("[InfoPanel] Error creating thumbnail:", error);
      const defaultIcon = this.getDefaultIcon(nodeData, diagramConfig);
      thumbnailEl.innerHTML = defaultIcon;
    }
  }
  // Método simplificado para resolver imagen del nodo
  resolveNodeImage(nodeData) {
    return nodeData.img || nodeData.data && nodeData.data.img || "";
  }
  getDefaultIcon(nodeData, diagramConfig = {}) {
    try {
      const nodeIcon = this.getNodeIconFromDiagram(nodeData);
      if (nodeIcon) {
        return nodeIcon;
      }
      const defaultIconName = diagramConfig.defaultIcon || "detail";
      return `<span class="${defaultIconName}" style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);"></span>`;
    } catch (error) {
      console.error("[InfoPanel] Error creating default icon:", error);
      return `<span style="display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--ui-panel-text-muted);">📄</span>`;
    }
  }
  getNodeIconFromDiagram(nodeData) {
    try {
      const iconName = nodeData.icon || nodeData.Icon || nodeData.data && nodeData.data.icon || nodeData.data && nodeData.data.Icon;
      if (iconName) {
        const iconUnicode = this.getIconUnicode(iconName);
        return `<span style="display: flex; align-items: center; justify-content: center; font-family: 'xdiagrams-icons'; font-size: 18px; color: var(--ui-panel-text);">${iconUnicode}</span>`;
      }
      return null;
    } catch (error) {
      console.error("[InfoPanel] Error getting node icon from diagram:", error);
      return null;
    }
  }
  getIconUnicode(iconName) {
    const iconUnicodeMap = {
      "detail": "",
      "list": "",
      "grid": "",
      "form": "",
      "document": "",
      "modal": "",
      "report": "",
      "profile": "",
      "home": "",
      "settings": ""
    };
    const normalizedName = this.normalizeIconName(iconName);
    return iconUnicodeMap[normalizedName] || iconUnicodeMap["detail"];
  }
  normalizeIconName(iconName) {
    if (!iconName || typeof iconName !== "string")
      return "";
    let normalized = iconName.toLowerCase().trim();
    normalized = normalized.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return normalized;
  }
  close() {
    this.isClosing = true;
    const panel = document.getElementById(this.options.panelId);
    panel?.classList.remove("open");
    const selectedNode = d3$1.select(".node-selected");
    if (!selectedNode.empty() && window.$xDiagrams?.navigation) {
      try {
        window.$xDiagrams.navigation.exitNodeNavigationMode(true);
      } catch (_) {
      }
    }
    try {
      window.dispatchEvent(new CustomEvent("xdiagrams:infopanel:close"));
    } catch (_) {
    }
    setTimeout(() => {
      this.isClosing = false;
    }, 300);
  }
  async buildFieldsHtml(nodeData, diagramConfig = {}) {
    try {
      const fields = [];
      const data = nodeData.data || nodeData;
      const showAllColumns = diagramConfig.showAllColumns !== false;
      const hideEmptyColumns = diagramConfig.hideEmptyColumns === true;
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("_") || key === "children" || key === "parent" || key === "Parent")
          continue;
        if (hideEmptyColumns && (!value || value.toString().trim() === ""))
          continue;
        const headerFields = ["name", "Name"];
        const idFields = ["id", "ID", "Node"];
        const internalFields = ["parent", "Parent", "img", "Img"];
        const urlFields = ["url", "URL", "Url"];
        const isUrlField = urlFields.includes(key);
        if (headerFields.includes(key) || idFields.includes(key) || internalFields.includes(key) || isUrlField) {
          console.log(`[InfoPanel] Excluyendo campo: ${key} (valor: ${value})`);
          continue;
        }
        if (!showAllColumns) {
          const allowedFields = ["title", "description", "desc"];
          if (!allowedFields.includes(key.toLowerCase()))
            continue;
        }
        const displayValue = this.formatValue(value);
        const isUrl = this.isUrl(value);
        fields.push({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          displayValue,
          isUrl,
          labelTitle: `Campo: ${key}`,
          valueTitle: isUrl ? `Abrir: ${value}` : void 0
        });
      }
      if (fields.length === 0) {
        return '<div class="side-panel-field"><div class="side-panel-value empty">No hay información disponible</div></div>';
      }
      let html = '<div class="side-panel-fields-table">';
      fields.forEach((field) => {
        html += `
          <div class="side-panel-field">
            <div class="side-panel-label" ${field.labelTitle ? `data-tooltip="${field.labelTitle}"` : ""}>${field.label}</div>
            <div class="side-panel-value ${!field.value ? "empty" : ""}" ${field.valueTitle ? `data-tooltip="${field.valueTitle}"` : ""}>
              ${field.isUrl ? `<a href="${field.value}" target="_blank" rel="noreferrer" class="side-panel-url-link">${field.displayValue}</a>` : field.displayValue}
            </div>
          </div>
        `;
      });
      html += "</div>";
      return html;
    } catch (error) {
      console.error("[InfoPanel] Error building fields HTML:", error);
      return '<div class="side-panel-field"><div class="side-panel-value empty">Error al cargar información</div></div>';
    }
  }
  formatValue(value) {
    if (value === null || value === void 0)
      return "";
    if (typeof value === "string")
      return this.escapeHtml(value);
    if (typeof value === "number")
      return value.toString();
    if (typeof value === "boolean")
      return value ? "Sí" : "No";
    if (Array.isArray(value))
      return value.join(", ");
    if (typeof value === "object")
      return JSON.stringify(value);
    return String(value);
  }
  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  isUrl(value) {
    if (typeof value !== "string")
      return false;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
  findUrl(nodeData) {
    const data = nodeData.data || nodeData;
    const urlValue = data["url"] || data["URL"] || data["Url"];
    if (urlValue && this.isUrl(urlValue)) {
      console.log(`[InfoPanel] URL encontrada en campo URL: ${urlValue}`);
      return urlValue;
    }
    return null;
  }
  // ===== MÉTODOS DE COMPATIBILIDAD =====
  updateInfoPanel(transform2) {
    console.warn("[InfoPanel] updateInfoPanel is deprecated, use open() instead");
  }
  getInfoPanelData() {
    return {};
  }
  clearInfoPanel() {
    this.close();
  }
  setInfoPanelValue(id2, value) {
    console.warn("[InfoPanel] setInfoPanelValue is deprecated");
  }
  getInfoPanelElement(id2) {
    return document.getElementById(id2);
  }
}
class XDiagramsFloatingTitlePill {
  constructor() {
    this.pillElement = null;
    this.isInitialized = false;
  }
  /**
   * Inicializa el pill flotante
   */
  init() {
    if (this.isInitialized)
      return;
    console.log("[Floating Title Pill] Iniciando...");
    this.createPillElement();
    this.isInitialized = true;
    console.log("[Floating Title Pill] Inicializado correctamente");
  }
  /**
   * Crea el elemento del pill flotante
   */
  createPillElement() {
    console.log("[Floating Title Pill] Creando elemento...");
    this.pillElement = document.createElement("div");
    this.pillElement.className = "floating-title-pill";
    this.pillElement.id = "xdiagrams-floating-title-pill";
    this.pillElement.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      left: 20px !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    `;
    document.body.appendChild(this.pillElement);
    console.log("[Floating Title Pill] Elemento creado y agregado al DOM");
  }
  /**
   * Actualiza el contenido del pill flotante
   * @param {string} title - Título del diagrama
   * @param {string} logoUrl - URL del logo
   */
  update(title, logoUrl) {
    if (!this.pillElement || !document.body.contains(this.pillElement)) {
      console.log("[Floating Title Pill] Elemento no encontrado en DOM, reinicializando...");
      this.init();
    }
    console.log("[Floating Title Pill] Actualizando con título:", title, "y logo:", logoUrl);
    this.pillElement.innerHTML = "";
    if (logoUrl) {
      const logoElement = document.createElement("img");
      logoElement.className = "floating-logo";
      logoElement.src = logoUrl;
      logoElement.alt = "Logo";
      this.pillElement.appendChild(logoElement);
    }
    if (title) {
      const titleElement = document.createElement("h2");
      titleElement.className = "floating-title";
      titleElement.textContent = title;
      this.pillElement.appendChild(titleElement);
    }
    this.pillElement.style.display = "flex";
    this.pillElement.style.visibility = "visible";
    this.pillElement.style.opacity = "1";
    this.forceApplyStyles();
    console.log("[Floating Title Pill] Actualizado correctamente");
    console.log("[Floating Title Pill] Elemento HTML:", this.pillElement.outerHTML);
  }
  /**
   * Obtiene el título del diagrama desde la configuración
   * @param {Object} config - Configuración del diagrama
   * @returns {string} Título del diagrama
   */
  getTitleFromConfig(config) {
    if (config.title)
      return config.title;
    if (config.name)
      return config.name;
    const pageTitle = document.querySelector("title");
    return pageTitle ? pageTitle.textContent : "Diagrama";
  }
  /**
   * Obtiene la URL del logo desde la configuración
   * @param {Object} config - Configuración del diagrama
   * @returns {string|null} URL del logo
   */
  getLogoFromConfig(config) {
    if (config.logo)
      return config.logo;
    if (window.$xDiagrams && window.$xDiagrams.logo)
      return window.$xDiagrams.logo;
    return null;
  }
  /**
   * Actualiza el pill flotante con la configuración del diagrama
   * @param {Object} config - Configuración del diagrama
   */
  updateFromConfig(config) {
    const title = this.getTitleFromConfig(config);
    const logoUrl = this.getLogoFromConfig(config);
    this.update(title, logoUrl);
  }
  /**
   * Muestra el pill flotante
   */
  show() {
    if (this.pillElement) {
      this.pillElement.style.display = "flex";
    }
  }
  /**
   * Oculta el pill flotante
   */
  hide() {
    if (this.pillElement) {
      this.pillElement.style.display = "none";
    }
  }
  /**
   * Destruye el pill flotante
   */
  destroy() {
    if (this.pillElement) {
      this.pillElement.remove();
      this.pillElement = null;
      this.isInitialized = false;
    }
  }
  /**
   * Verifica que el pill esté visible y lo restaura si es necesario
   */
  ensureVisible() {
    if (!this.pillElement || !document.body.contains(this.pillElement)) {
      console.log("[Floating Title Pill] Elemento perdido, restaurando...");
      this.init();
      return;
    }
    const rect = this.pillElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || this.pillElement.style.display === "none") {
      console.log("[Floating Title Pill] Elemento no visible, restaurando...");
      this.pillElement.style.display = "flex";
      this.pillElement.style.visibility = "visible";
      this.pillElement.style.opacity = "1";
    }
  }
  /**
   * Inicia el monitoreo de visibilidad
   */
  startVisibilityMonitoring() {
    setInterval(() => {
      this.ensureVisible();
    }, 2e3);
  }
  /**
   * Escucha cambios de tema y actualiza el pill
   */
  setupThemeListener() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          console.log("[Floating Title Pill] Tema cambiado, actualizando estilos...");
          this.updateThemeStyles();
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }
  /**
   * Actualiza los estilos del pill según el tema actual
   */
  updateThemeStyles() {
    if (!this.pillElement)
      return;
    const currentTheme = document.body.getAttribute("data-theme") || "light";
    const bodyClasses = document.body.className;
    console.log("[Floating Title Pill] Tema actual:", currentTheme);
    console.log("[Floating Title Pill] Clases del body:", bodyClasses);
    console.log("[Floating Title Pill] Variables CSS aplicadas:", {
      "--ui-panel-bg": getComputedStyle(this.pillElement).getPropertyValue("--ui-panel-bg"),
      "--ui-panel-text": getComputedStyle(this.pillElement).getPropertyValue("--ui-panel-text"),
      "--ui-panel-border": getComputedStyle(this.pillElement).getPropertyValue("--ui-panel-border")
    });
    this.ensureVisible();
  }
  /**
   * Fuerza la aplicación de estilos CSS
   */
  forceApplyStyles() {
    if (!this.pillElement)
      return;
    this.pillElement.offsetHeight;
    const computedStyle = getComputedStyle(this.pillElement);
    console.log("[Floating Title Pill] Estilos computados:", {
      background: computedStyle.background,
      color: computedStyle.color,
      border: computedStyle.border,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity
    });
  }
}
class XDiagramsUIManager {
  constructor() {
    console.log("[UI Manager] Inicializando...");
    this.loadingManager = new XDiagramsLoadingManager();
    this.errorManager = new XDiagramsErrorManager();
    this.notificationManager = new XDiagramsNotificationManager();
    this.infoPanel = new XDiagramsInfoPanel();
    this.floatingTitlePill = new XDiagramsFloatingTitlePill();
    console.log("[UI Manager] Inicializado correctamente");
  }
  // Métodos de coordinación esencial
  showLoading() {
    return this.loadingManager.show();
  }
  hideLoading() {
    return this.loadingManager.hide();
  }
  showErrorMessage(error) {
    return this.errorManager.showError(error);
  }
  showSimpleErrorMessage(message) {
    return this.errorManager.showSimpleError(message);
  }
  showCacheClearedNotification() {
    return this.notificationManager.showCacheCleared();
  }
  // Métodos del InfoPanel
  openInfoPanel(nodeData, diagramConfig = {}) {
    return this.infoPanel.open(nodeData, diagramConfig);
  }
  closeInfoPanel() {
    return this.infoPanel.close();
  }
  updateInfoPanel(transform2) {
    return this.infoPanel.updateInfoPanel(transform2);
  }
  getInfoPanelData() {
    return this.infoPanel.getInfoPanelData();
  }
  clearInfoPanel() {
    return this.infoPanel.clearInfoPanel();
  }
  setInfoPanelValue(id2, value) {
    return this.infoPanel.setInfoPanelValue(id2, value);
  }
  getInfoPanelElement(id2) {
    return this.infoPanel.getInfoPanelElement(id2);
  }
  // Acceso directo a los submódulos para casos específicos
  get loadingManagerInstance() {
    return this.loadingManager;
  }
  get errorManagerInstance() {
    return this.errorManager;
  }
  get notificationManagerInstance() {
    return this.notificationManager;
  }
  get infoPanelInstance() {
    return this.infoPanel;
  }
  // Propiedades delegadas del InfoPanel
  get isInfoPanelClosing() {
    return this.infoPanel.isClosing;
  }
  // Métodos del Floating Title Pill
  updateFloatingTitlePill(config) {
    console.log("[UI Manager] Actualizando pill flotante con config:", config);
    this.floatingTitlePill.updateFromConfig(config);
    this.floatingTitlePill.startVisibilityMonitoring();
    this.floatingTitlePill.setupThemeListener();
  }
  showFloatingTitlePill() {
    return this.floatingTitlePill.show();
  }
  hideFloatingTitlePill() {
    return this.floatingTitlePill.hide();
  }
  destroyFloatingTitlePill() {
    return this.floatingTitlePill.destroy();
  }
  // Acceso directo al Floating Title Pill
  get floatingTitlePillInstance() {
    return this.floatingTitlePill;
  }
}
class XDiagramsDiagramRenderer {
  constructor(core) {
    this.core = core;
  }
  renderTrees(trees, container) {
    const { clusterGapX, clusterGapY } = this.core.config;
    const clustersPerRowConfig = this.core.config.clustersPerRow ? this.core.config.clustersPerRow.split(" ").map((n) => parseInt(n)) : this.calculateOptimalLayout(trees.length);
    const titleHeight = 450;
    const clusterDimensions = trees.map((tree2, index) => {
      const treeSize = this.calculateTreeSize(tree2);
      return {
        tree: tree2,
        index,
        clusterWidth: treeSize.width,
        clusterHeight: treeSize.height
      };
    });
    const { treeLayouts, maxRowWidth, totalHeight } = this.calculateLayout(
      clusterDimensions,
      clustersPerRowConfig,
      clusterGapX,
      clusterGapY
    );
    const clusterGroups = treeLayouts.map((layout, index) => {
      const { tree: tree2, clusterWidth, clusterHeight, x, y } = layout;
      const clusterGroup = container.append("g").attr("class", "cluster").attr("id", `cluster-${tree2.id}`).attr("transform", `translate(${x}, ${y})`).style("opacity", 0);
      const treeGroup = clusterGroup.append("g").attr("class", "tree-group");
      treeGroup.append("rect").attr("class", "cluster-bg").attr("width", clusterWidth).attr("height", clusterHeight).attr("x", 0).attr("y", 0).attr("tabindex", "0").style("outline", "none");
      this.core.clusterPositions.set(tree2.name, {
        x,
        y,
        width: clusterWidth,
        height: clusterHeight
      });
      const titleContainer = treeGroup.append("g").attr("class", "cluster-title-container");
      const titleBg = titleContainer.append("rect").attr("class", "cluster-title-bg").attr("rx", 8).attr("ry", 8);
      const titleText = titleContainer.append("text").attr("class", "cluster-title").attr("x", 50).attr("y", 150).text(tree2.id || tree2.name);
      titleText.attr("data-cluster-name", tree2.name);
      const titleBBox = titleText.node().getBBox();
      titleBg.attr("x", titleBBox.x - 56).attr("y", titleBBox.y - 32).attr("width", titleBBox.width + 112).attr("height", titleBBox.height + 64);
      const largeTitleBg = titleContainer.append("rect").attr("class", "cluster-hover-title-large-bg").attr("x", 0).attr("y", 0).attr("rx", 80).attr("ry", 80);
      const largeTitleText = titleContainer.append("text").attr("class", "cluster-hover-title-large").attr("x", 150).attr("y", 350).text(tree2.id || tree2.name).attr("data-cluster-name", tree2.name);
      const largeTitleBBox = largeTitleText.node().getBBox();
      const paddingX = 120;
      const paddingY = 90;
      largeTitleBg.attr("x", largeTitleBBox.x - paddingX).attr("y", largeTitleBBox.y - paddingY).attr("width", largeTitleBBox.width + paddingX * 2).attr("height", largeTitleBBox.height + paddingY * 2);
      console.log("🔍 [DiagramRenderer] Texto grande creado para cluster:", tree2.name, largeTitleText.node());
      let hideLargeTitlePermanently = false;
      clusterGroup.on("mouseenter", () => {
        if (hideLargeTitlePermanently)
          return;
        const currentZoom = this.core.navigation.zoomManager.getCurrentZoom();
        if (currentZoom <= 0.1) {
          largeTitleText.style("opacity", 1);
          largeTitleBg.style("opacity", 1);
        }
      }).on("mouseleave", () => {
        if (hideLargeTitlePermanently)
          return;
        largeTitleText.style("opacity", 0);
        largeTitleBg.style("opacity", 0);
      }).on("click", () => {
        hideLargeTitlePermanently = true;
        largeTitleText.style("opacity", 0);
        largeTitleBg.style("opacity", 0);
        setTimeout(() => {
          hideLargeTitlePermanently = false;
        }, 2e3);
      });
      const zoomListener = () => {
        const currentZoom = this.core.navigation.zoomManager.getCurrentZoom();
        if (currentZoom > 0.1) {
          largeTitleText.style("opacity", 0);
          largeTitleBg.style("opacity", 0);
        }
      };
      if (this.core.navigation && this.core.navigation.zoomManager) {
        this.core.navigation.zoomManager.onZoomChange(zoomListener);
      }
      const treeContent = treeGroup.append("g").attr("class", "tree-content");
      const hierarchy2 = d3.hierarchy(tree2);
      d3.tree().nodeSize([
        this.core.config.nodeWidth + this.core.config.spacing,
        this.core.config.nodeHeight + this.core.config.verticalSpacing
      ])(hierarchy2);
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      hierarchy2.descendants().forEach((node) => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + this.core.config.nodeWidth);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + this.core.config.nodeHeight);
      });
      const treeCenterX = clusterWidth / 2 - (minX + maxX) / 2;
      const treeCenterY = titleHeight + (clusterHeight - titleHeight - titleHeight) / 2 - (minY + maxY) / 2;
      this.renderTreeSimple(tree2, treeContent, treeCenterX, treeCenterY);
      return clusterGroup;
    });
    this.addClusterClickEvents(clusterGroups, container);
    this.setupThemeChangeListener();
    this.updateCounters(this.countTotalNodes(trees), trees.length);
    this.applyInitialZoomImmediate(container, maxRowWidth, totalHeight);
    setTimeout(() => {
      if (this.core.uiManager) {
        this.core.uiManager.hideLoading();
      }
      setTimeout(() => {
        clusterGroups.forEach((group) => group.style("opacity", 1));
        const diagram = d3.select("#diagram");
        diagram.select("g").style("opacity", null).style("visibility", null);
        diagram.style("opacity", 1).style("visibility", "visible");
        document.getElementById("diagram").style.cssText = "opacity: 1; visibility: visible;";
        this.core.thumbs.showIconsWithFadeIn();
        this.core.navigation.keyboardNavInstance.initialize();
      }, 300);
    }, 100);
  }
  calculateOptimalLayout(totalTrees) {
    const cols = Math.ceil(Math.sqrt(totalTrees));
    const rows = Math.ceil(totalTrees / cols);
    const layout = [];
    for (let i = 0; i < rows; i++) {
      layout.push(Math.min(cols, totalTrees - i * cols));
    }
    return layout;
  }
  calculateLayout(clusterDimensions, clustersPerRowConfig, clusterGapX, clusterGapY) {
    const treeLayouts = [];
    const rowWidths = [];
    const rowHeights = [];
    let currentIndex = 0;
    let currentRow = 0;
    while (currentIndex < clusterDimensions.length) {
      const clustersInThisRow = clustersPerRowConfig[currentRow] || 7;
      const endIndex = Math.min(currentIndex + clustersInThisRow, clusterDimensions.length);
      const rowClusters = clusterDimensions.slice(currentIndex, endIndex);
      const rowWidth = rowClusters.reduce((total, cluster) => {
        return total + (this.calculateTreeSize(cluster.tree).treeWidth + 280 + 280);
      }, 0) + (rowClusters.length - 1) * clusterGapX;
      rowWidths.push(rowWidth);
      rowHeights.push(Math.max(...rowClusters.map((c) => c.clusterHeight)));
      currentIndex = endIndex;
      currentRow++;
    }
    const maxRowWidth = Math.max(...rowWidths);
    let currentY = 30;
    currentIndex = 0;
    currentRow = 0;
    while (currentIndex < clusterDimensions.length) {
      const clustersInThisRow = clustersPerRowConfig[currentRow] || 7;
      const endIndex = Math.min(currentIndex + clustersInThisRow, clusterDimensions.length);
      const rowClusters = clusterDimensions.slice(currentIndex, endIndex);
      const rowHeight = rowHeights[currentRow];
      const clusterWidths = rowClusters.map((cluster) => {
        return this.calculateTreeSize(cluster.tree).treeWidth + 280 + 280;
      });
      const totalClusterWidth = clusterWidths.reduce((sum, width) => sum + width, 0);
      const availableWidth = maxRowWidth - (rowClusters.length - 1) * clusterGapX;
      const extraWidth = Math.max(0, availableWidth - totalClusterWidth);
      const clusterWidthsWithExtra = clusterWidths.map((width, index) => {
        const proportion = extraWidth > 0 ? width / totalClusterWidth : 0;
        return width + extraWidth * proportion;
      });
      let currentX = 0;
      rowClusters.forEach((cluster, index) => {
        const finalWidth = clusterWidthsWithExtra[index];
        treeLayouts.push({
          tree: cluster.tree,
          clusterWidth: finalWidth,
          clusterHeight: rowHeight,
          x: currentX,
          y: currentY
        });
        currentX += finalWidth + clusterGapX;
      });
      currentY += rowHeight + clusterGapY;
      currentIndex = endIndex;
      currentRow++;
    }
    const totalHeight = rowHeights.reduce((sum, height, index) => {
      return sum + height + (index < rowHeights.length - 1 ? clusterGapY : 0);
    }, 30);
    return { treeLayouts, maxRowWidth, totalHeight };
  }
  isLinearTree(root2) {
    if (!root2.children || root2.children.length === 0)
      return true;
    function checkLinear(node) {
      if (!node.children || node.children.length === 0)
        return true;
      if (node.children.length > 1)
        return false;
      return checkLinear(node.children[0]);
    }
    return checkLinear(root2);
  }
  hasLinearBranches(root2) {
    if (!root2.children || root2.children.length === 0)
      return true;
    function checkBranchLinear(node) {
      if (!node.children || node.children.length === 0)
        return true;
      if (node.children.length > 1)
        return false;
      return checkBranchLinear(node.children[0]);
    }
    return root2.children.every((child) => checkBranchLinear(child));
  }
  isSingleLevelTree(root2) {
    if (!root2.children || root2.children.length === 0)
      return true;
    return root2.children.every((child) => !child.children || child.children.length === 0);
  }
  renderTreeSimple(node, container, x = 0, y = 0) {
    const { nodeWidth, nodeHeight, linearSpacing, branchedSpacing } = this.core.config;
    const hierarchy2 = d3.hierarchy(node);
    const isLinear = this.isLinearTree(hierarchy2);
    const hasLinearBranches = this.hasLinearBranches(hierarchy2);
    const isSingleLevel = this.isSingleLevelTree(hierarchy2);
    const spacing = isLinear || hasLinearBranches ? linearSpacing : branchedSpacing;
    d3.tree().nodeSize([nodeWidth + spacing, nodeHeight + this.core.config.verticalSpacing])(hierarchy2);
    if (hierarchy2.children && hierarchy2.children.length > 1 && (hasLinearBranches || isSingleLevel)) {
      const nonEmptyChildren = hierarchy2.children.filter(
        (child) => child.children && child.children.length > 0
      );
      let spacingBetweenBranches = 0;
      if (nonEmptyChildren.length > 1) {
        const sortedChildren = nonEmptyChildren.sort((a, b) => a.x - b.x);
        const totalSpread = sortedChildren[sortedChildren.length - 1].x - sortedChildren[0].x;
        spacingBetweenBranches = totalSpread / (nonEmptyChildren.length - 1);
      }
      hierarchy2.children.forEach((child, index) => {
        if ((!child.children || child.children.length === 0) && spacingBetweenBranches > 0) {
          if (index > 0) {
            const prevChild = hierarchy2.children[index - 1];
            const currentDistance = child.x - prevChild.x;
            if (currentDistance < spacingBetweenBranches) {
              const adjustment = spacingBetweenBranches - currentDistance;
              child.x += adjustment;
            }
          } else {
            const nextChild = hierarchy2.children[index + 1];
            if (nextChild) {
              const currentDistance = nextChild.x - child.x;
              if (currentDistance < spacingBetweenBranches) {
                const adjustment = spacingBetweenBranches - currentDistance;
                child.x -= adjustment;
              }
            }
          }
        }
      });
    }
    this.renderTreeFromLayout(hierarchy2, container, x, y);
  }
  renderTreeFromLayout(node, container, offsetX = 0, offsetY = 0) {
    const { nodeWidth, nodeHeight } = this.core.config;
    const nodeGroup = container.append("g").attr("class", "node").attr("transform", `translate(${offsetX + node.x}, ${offsetY + node.y})`).datum(node);
    nodeGroup.append("rect").attr("width", nodeWidth).attr("height", nodeHeight).style("pointer-events", "all");
    this.core.thumbs.createThumbnailElement(
      node.data,
      nodeGroup,
      nodeWidth / 2,
      nodeHeight / 2,
      82,
      82
    );
    this.core.textHandler.renderNodeTextCentered(
      nodeGroup,
      node.data.name,
      nodeWidth / 2,
      nodeHeight * 0.7,
      {
        maxWidth: this.core.config.textConfig.maxWidth,
        fontSize: this.core.config.textConfig.nodeNameFontSize,
        lineHeight: this.core.config.textConfig.lineHeight,
        fontWeight: "bold",
        textAnchor: "middle",
        dominantBaseline: "middle"
      }
    );
    if (node.data.id) {
      const hasParent = node.parent !== null;
      const idX = hasParent ? offsetX + node.x + 44 : offsetX + node.x + nodeWidth / 2;
      const textAnchor = hasParent ? "end" : "middle";
      container.append("text").attr("class", "node-id-label").attr("x", idX).attr("y", offsetY + node.y - 7).style("font-size", "6px").style("font-weight", "normal").style("text-anchor", textAnchor).style("dominant-baseline", "baseline").text(node.data.id);
    }
    nodeGroup.style("cursor", "pointer").style("pointer-events", "all").on("click", (event2) => {
      event2.stopPropagation();
      let clusterGroup = null;
      try {
        const clusterElement = nodeGroup.node()?.closest(".cluster");
        if (clusterElement) {
          clusterGroup = d3.select(clusterElement);
        }
      } catch (e) {
      }
      if (clusterGroup && !clusterGroup.empty()) {
        if (!clusterGroup.select(".cluster-bg").classed("cluster-focused")) {
          this.core.navigation.clusterNavInstance.zoomToCluster(clusterGroup, this.core.globalContainer, false, false);
          return;
        }
        this.selectNodeAndZoomToIt(nodeGroup, node);
      }
    }).on("dblclick", (event2) => {
      event2.stopPropagation();
      if (!d3.select(".node-selected").empty()) {
        this.core.navigation.nodeNavInstance.exitNodeNavigationMode(true);
        return;
      }
      this.selectNodeAndZoomToIt(nodeGroup, node);
    });
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const sourceX = offsetX + node.x + nodeWidth / 2;
        const sourceY = offsetY + node.y + nodeHeight;
        const targetX = offsetX + child.x + nodeWidth / 2;
        const targetY = offsetY + child.y;
        container.insert("path", ":first-child").attr("class", "link").attr("d", this.createLinkPath(sourceX, sourceY, targetX, targetY));
        this.renderTreeFromLayout(child, container, offsetX, offsetY);
      });
    }
  }
  createLinkPath(sourceX, sourceY, targetX, targetY) {
    const { cornerRadius, verticalTolerance } = this.core.config.linkConfig;
    const diagonal = (sourceX2, sourceY2, targetX2, targetY2) => {
      const midY = (sourceY2 + targetY2) / 2;
      const cornerRadius2 = this.core.config.linkConfig.cornerRadius;
      if (Math.abs(sourceX2 - targetX2) < this.core.config.linkConfig.verticalTolerance) {
        return `M${sourceX2},${sourceY2} L${targetX2},${targetY2}`;
      }
      if (targetX2 < sourceX2) {
        return `
          M${sourceX2},${sourceY2}
          L${sourceX2},${midY - cornerRadius2}
          Q${sourceX2},${midY} ${sourceX2 - cornerRadius2},${midY}
          L${targetX2 + cornerRadius2},${midY}
          Q${targetX2},${midY} ${targetX2},${midY + cornerRadius2}
          L${targetX2},${targetY2}
        `;
      } else {
        return `
          M${sourceX2},${sourceY2}
          L${sourceX2},${midY - cornerRadius2}
          Q${sourceX2},${midY} ${sourceX2 + cornerRadius2},${midY}
          L${targetX2 - cornerRadius2},${midY}
          Q${targetX2},${midY} ${targetX2},${midY + cornerRadius2}
          L${targetX2},${targetY2}
        `;
      }
    };
    return diagonal(sourceX, sourceY, targetX, targetY);
  }
  countTotalNodes(trees) {
    let totalNodes = 0;
    const countNodesRecursive = (node) => {
      totalNodes++;
      node.children.forEach(countNodesRecursive);
    };
    trees.forEach(countNodesRecursive);
    return totalNodes;
  }
  calculateTreeSize(node) {
    const hierarchy2 = d3.hierarchy(node);
    const isLinear = this.isLinearTree(hierarchy2);
    const hasLinearBranches = this.hasLinearBranches(hierarchy2);
    const spacing = isLinear || hasLinearBranches ? this.core.config.linearSpacing : this.core.config.branchedSpacing;
    d3.tree().nodeSize([
      this.core.config.nodeWidth + spacing,
      this.core.config.nodeHeight + this.core.config.verticalSpacing
    ])(hierarchy2);
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    hierarchy2.descendants().forEach((node2) => {
      minX = Math.min(minX, node2.x);
      maxX = Math.max(maxX, node2.x + this.core.config.nodeWidth);
      minY = Math.min(minY, node2.y);
      maxY = Math.max(maxY, node2.y + this.core.config.nodeHeight);
    });
    if (minX === Infinity)
      minX = 0;
    if (maxX === -Infinity)
      maxX = this.core.config.nodeWidth;
    if (minY === Infinity)
      minY = 0;
    if (maxY === -Infinity)
      maxY = this.core.config.nodeHeight;
    const rootNode = hierarchy2.descendants().find((node2) => node2.depth === 0);
    const rootX = rootNode ? rootNode.x : 0;
    const leftDistance = Math.abs(minX - rootX);
    const rightDistance = Math.abs(maxX - rootX);
    const treeWidth = 2 * Math.max(leftDistance, rightDistance) + this.core.config.nodeWidth;
    const treeHeight = maxY - minY;
    const calculatedHeight = treeHeight > 0 ? treeHeight : (hierarchy2.height + 1) * (this.core.config.nodeHeight + this.core.config.verticalSpacing);
    return {
      width: treeWidth + 280 + 280,
      height: 1.1 * (calculatedHeight + this.core.config.nodeWidth + 280 + 450),
      treeWidth,
      treeHeight: calculatedHeight
    };
  }
  addClusterClickEvents(clusterGroups, container) {
    clusterGroups.forEach((clusterGroup) => {
      ["cluster-bg", "cluster-title"].forEach((className) => {
        const element = clusterGroup.select(`.${className}`);
        let startX = 0, startY = 0, isDragging = false;
        element.style("cursor", "pointer").on("mousedown", (event2) => {
          startX = event2.clientX;
          startY = event2.clientY;
          isDragging = false;
        }).on("mousemove", (event2) => {
          if (startX !== 0 && startY !== 0) {
            const deltaX = Math.abs(event2.clientX - startX);
            const deltaY = Math.abs(event2.clientY - startY);
            if (deltaX > 10 || deltaY > 10) {
              isDragging = true;
            }
          }
        }).on("click", (event2) => {
          if (!isDragging) {
            event2.stopPropagation();
            event2.preventDefault();
            if (!d3.select(".node-selected").empty()) {
              return;
            }
            if (clusterGroup && !clusterGroup.empty()) {
              this.core.navigation.clusterNavInstance.zoomToCluster(clusterGroup, container, false, false);
            }
          }
          startX = 0;
          startY = 0;
          isDragging = false;
        });
      });
    });
    d3.select("#diagram").on("dblclick", (event2) => {
      if (!d3.select(".node-selected").empty()) {
        this.core.navigation.nodeNavInstance.exitNodeNavigationMode(true);
        return;
      }
      this.core.navigation.zoomControlsInstance.resetZoom(container);
    });
    d3.select("#diagram").on("click", (event2) => {
      if (event2.target === event2.currentTarget) {
        if (!d3.select(".node-selected").empty()) {
          event2.stopPropagation();
          event2.preventDefault();
          return;
        }
        this.core.navigation.clusterNavInstance.deselectClusterOnOutsideClick();
      }
    });
    this.core.navigation.createZoomControls();
    this.core.navigation.setupKeyboardNavigation(container);
  }
  updateCounters(totalNodes, totalClusters) {
    const counters = {
      "node-count": totalNodes,
      "cluster-count": totalClusters,
      "render-type": "SVG"
    };
    Object.entries(counters).forEach(([id2, value]) => {
      const element = document.getElementById(id2);
      if (element) {
        element.textContent = value;
      }
    });
  }
  applyInitialZoom(container, diagramWidth, diagramHeight) {
    this.applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, 1e3);
  }
  applyInitialZoomImmediate(container, diagramWidth, diagramHeight) {
    this.applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, 0);
  }
  applyInitialZoomWithTransition(container, diagramWidth, diagramHeight, duration = 0) {
    const diagram = d3.select("#diagram");
    const diagramNode = diagram.node();
    const diagramRect = diagramNode.getBoundingClientRect();
    const { width: viewportWidth, height: viewportHeight } = diagramRect;
    const bounds = this.calculateDiagramBounds();
    const actualWidth = bounds.width || diagramWidth;
    const actualHeight = bounds.height || diagramHeight;
    const scaleX = viewportWidth / actualWidth;
    const scaleY = viewportHeight / actualHeight;
    const baseScale = Math.min(scaleX, scaleY);
    const userScale = this.core.config.initialZoom?.scale || 0.95;
    const userPadding = this.core.config.initialZoom?.padding || 0.05;
    let finalScale = baseScale * userScale * (1 - userPadding);
    finalScale = Math.max(0.05, Math.min(2, finalScale));
    const translateX = (viewportWidth - actualWidth * finalScale) / 2;
    const translateY = (viewportHeight - actualHeight * finalScale) / 2;
    const transform2 = d3.zoomIdentity.translate(translateX, translateY).scale(finalScale);
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.setInitialTransform(transform2);
    }
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      if (duration > 0) {
        this.core.navigation.zoomManagerInstance.zoomTo(transform2, duration);
      } else {
        this.core.navigation.zoomManagerInstance.zoomToImmediate(transform2);
      }
    }
    this.updateInfoPanel(transform2);
    this.core.navigation.clusterNavInstance.deselectActiveCluster();
  }
  calculateDiagramBounds() {
    const clusters = d3.selectAll(".cluster");
    if (clusters.empty()) {
      return { width: 8e3, height: 8e3 };
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let clusterCount = 0;
    clusters.each(function() {
      const cluster = d3.select(this);
      const transform2 = cluster.attr("transform");
      const bg = cluster.select(".cluster-bg");
      if (transform2 && !bg.empty()) {
        const match = transform2.match(/translate\(([^,]+),\s*([^)]+)\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const width = parseFloat(bg.attr("width"));
          const height = parseFloat(bg.attr("height"));
          if (!isNaN(x) && !isNaN(y) && !isNaN(width) && !isNaN(height)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x + width);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y + height);
            clusterCount++;
          }
        }
      }
    });
    if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity || clusterCount === 0) {
      return { width: 8e3, height: 8e3 };
    }
    return {
      width: maxX - minX,
      height: maxY - minY
    };
  }
  updateInfoPanel(transform2) {
    if (this.core.uiManager) {
      this.core.uiManager.updateInfoPanel(transform2);
    }
  }
  selectNodeAndZoomToIt(nodeGroup, node) {
    this.core.navigation.nodeNavInstance.selectNode(nodeGroup, true);
    this.zoomToNode(nodeGroup, node, true);
  }
  zoomToNode(nodeGroup, node, isClickNavigation = false) {
    const diagram = d3.select("#diagram");
    if (diagram.empty())
      return;
    const diagramNode = diagram.node();
    const currentTransform = d3.zoomTransform(diagramNode);
    const nodeRect = nodeGroup.node().getBoundingClientRect();
    const diagramRect = diagramNode.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    const diagramX = (nodeCenterX - currentTransform.x) / currentTransform.k;
    const diagramY = (nodeCenterY - currentTransform.y) / currentTransform.k;
    const targetScale = 1.6;
    const viewportCenterX = diagramRect.width / 2;
    const viewportCenterY = diagramRect.height / 2;
    const sidePanel = document.getElementById("side-panel");
    let panelOffset = 0;
    if (sidePanel && sidePanel.style.display !== "none") {
      panelOffset = sidePanel.getBoundingClientRect().width;
    }
    const adjustedCenterX = viewportCenterX - panelOffset / 2;
    const newX = adjustedCenterX - diagramX * targetScale;
    const newY = viewportCenterY - diagramY * targetScale;
    const newTransform = d3.zoomIdentity.translate(newX, newY).scale(targetScale);
    let duration = 800;
    if (isClickNavigation) {
      duration = 600;
    } else if (this.core.navigation && this.core.navigation.lastNodeDistance) {
      const distance = this.core.navigation.lastNodeDistance;
      let baseDuration, maxDuration;
      if (this.core.navigation.isCircularNavigation) {
        baseDuration = 1e3;
        maxDuration = 3e3;
      } else {
        baseDuration = 400;
        maxDuration = 1200;
      }
      duration = baseDuration + (maxDuration - baseDuration) * Math.min(distance / 800, 1);
    }
    if (this.core.navigation && this.core.navigation.zoomManagerInstance) {
      this.core.navigation.zoomManagerInstance.zoomTo(newTransform, duration);
    } else {
      diagram.transition().duration(duration).ease(d3.easeCubicOut).call(d3.zoom().transform, newTransform);
    }
  }
  setupThemeChangeListener() {
    document.addEventListener("themechange", (event2) => {
      this.updateClusterBorderRadius();
    });
  }
  updateClusterBorderRadius() {
    console.log("Theme changed, CSS should handle border-radius automatically");
  }
}
class XDiagramsHierarchyBuilder {
  constructor() {
  }
  buildHierarchy(data) {
    const nodeMap = /* @__PURE__ */ new Map();
    const rootNodes = [];
    const getColumnValue = (row, possibleNames, defaultValue = "") => {
      for (const name of possibleNames) {
        if (row[name] !== void 0 && row[name] !== null && row[name] !== "") {
          return row[name];
        }
      }
      return defaultValue;
    };
    data.forEach((row) => {
      const id2 = getColumnValue(row, ["ID", "id", "Node", "node", "Id"], null);
      const name = getColumnValue(row, ["Name", "name", "Title", "title"], null);
      const parent = getColumnValue(row, ["Parent", "parent", "Manager", "manager", "Leader", "leader"], null);
      const img = getColumnValue(row, ["Img", "img", "Icon", "icon"], null);
      if (id2 && name && name.trim()) {
        const node = {
          id: id2,
          name: name.trim(),
          parent,
          img,
          layout: getColumnValue(row, ["Layout", "layout"], null),
          data: row,
          children: []
        };
        nodeMap.set(id2, node);
      }
    });
    nodeMap.forEach((node) => {
      if (node.parent && nodeMap.has(node.parent)) {
        nodeMap.get(node.parent).children.push(node);
      } else if (node.parent) {
        const parentByName = Array.from(nodeMap.values()).find(
          (n) => n.name === node.parent || n.id === node.parent
        );
        if (parentByName) {
          parentByName.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });
    return rootNodes;
  }
}
class XDiagramsSVGManager {
  constructor() {
    this.diagram = null;
    this.container = null;
  }
  createDiagram() {
    let diagram = d3.select("#diagram");
    if (diagram.empty()) {
      const app = d3.select("#app");
      if (app.empty()) {
        console.error("XDiagrams: Elemento #app no encontrado");
        return null;
      }
      const width = window.innerWidth;
      const height = window.innerHeight;
      diagram = app.append("svg").attr("id", "diagram").attr("width", width).attr("height", height).style("position", "absolute").style("top", "0").style("left", "0").style("width", "100%").style("height", "100%");
    }
    const container = diagram.append("g").style("opacity", 0).style("visibility", "hidden");
    diagram.style("opacity", 0).style("visibility", "hidden");
    this.diagram = diagram;
    this.container = container;
    return { diagram, container };
  }
  ensureDiagramHidden() {
    const diagram = document.getElementById("diagram");
    if (diagram) {
      diagram.style.cssText = "opacity: 0; visibility: hidden; transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out";
    }
  }
  showDiagram() {
    if (this.diagram) {
      this.diagram.style("opacity", 1).style("visibility", "visible");
      if (this.container) {
        this.container.style("opacity", 1).style("visibility", "visible");
      }
    }
  }
  hideDiagram() {
    if (this.diagram) {
      this.diagram.style("opacity", 0).style("visibility", "hidden");
      if (this.container) {
        this.container.style("opacity", 0).style("visibility", "hidden");
      }
    }
  }
  clearDiagram() {
    if (this.diagram) {
      this.diagram.selectAll("*").remove();
    }
  }
  getDiagram() {
    return this.diagram;
  }
  getContainer() {
    return this.container;
  }
  getDiagramDimensions() {
    if (!this.diagram)
      return { width: 0, height: 0 };
    const node = this.diagram.node();
    return {
      width: node.clientWidth || window.innerWidth,
      height: node.clientHeight || window.innerHeight
    };
  }
}
class XDiagramsDiagramManager {
  constructor(core) {
    this.core = core;
  }
  async initDiagram() {
    try {
      if (!this.core.config.url) {
        console.error("XDiagrams: URL de datos no configurada");
        this.core.uiManager.hideLoading();
        return;
      }
      this.core.uiManager.showLoading();
      const { diagram, container } = this.core.svgManager.createDiagram();
      if (!diagram || !container) {
        throw new Error("No se pudo crear el diagrama");
      }
      this.core.navigation.zoomManagerInstance.setupZoom(diagram, this.core.navigation);
      const data = await this.loadData();
      const trees = this.core.hierarchyBuilder.buildHierarchy(data);
      this.core.globalTrees = trees;
      this.core.globalContainer = container;
      this.core.diagramRenderer.renderTrees(trees, container);
      console.log("[Diagram Manager] Inicializando generador de datos LLM...");
      await this.core.llmDataGenerator.initialize(data, this.core.config);
      console.log("[Diagram Manager] Generador de datos LLM inicializado");
      console.log("[Diagram Manager] Inicializando pill flotante...");
      this.core.uiManager.updateFloatingTitlePill(this.core.config);
      console.log("[Diagram Manager] Pill flotante inicializado");
    } catch (error) {
      console.error("XDiagrams: Error de inicialización:", error);
      this.core.uiManager.hideLoading();
      this.core.uiManager.showErrorMessage(error);
    }
  }
  async loadData() {
    let data;
    if (window.xDiagramsLoader) {
      await new Promise((resolve, reject) => {
        window.xDiagramsLoader.loadData(this.core.config.url, (result, error) => {
          if (error) {
            console.error("XDiagrams: Error en loader:", error);
            reject(error);
          } else {
            data = result;
            resolve();
          }
        });
      });
    } else {
      const response = await fetch(this.core.config.url);
      const csvText = await response.text();
      data = await new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      });
    }
    return data;
  }
  clearCacheAndReload() {
    if (window.xDiagramsLoader) {
      window.xDiagramsLoader.clearCache();
      this.core.uiManager.showCacheClearedNotification();
      setTimeout(() => {
        this.reloadDiagram();
      }, 500);
    } else {
      console.warn("XDiagrams: Loader no disponible");
    }
  }
  async reloadDiagram() {
    try {
      this.core.navigation.destroyZoomControls();
      this.core.svgManager.clearDiagram();
      this.core.navigation.createZoomControls();
      await this.initDiagram();
    } catch (error) {
      console.error("XDiagrams: Error de recarga:", error);
    }
  }
  setupEventListeners() {
    window.addEventListener("xdiagrams-retry", () => {
      this.initDiagram();
    });
  }
}
class XDiagramsLLMDataGenerator {
  constructor() {
    this.storageKey = "xdiagrams_llm_data";
    this.lastUpdateKey = "xdiagrams_llm_last_update";
    this.updateInterval = 5 * 60 * 1e3;
  }
  /**
   * Inicializa el generador de datos LLM
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  async initialize(csvData, config = {}) {
    try {
      console.log("[LLMDataGenerator] Inicializando generador de datos LLM...");
      if (this.shouldUpdateData()) {
        await this.generateLLMData(csvData, config);
      } else {
        console.log("[LLMDataGenerator] Datos LLM actualizados recientemente, usando caché");
      }
      this.scheduleBackgroundUpdate(csvData, config);
    } catch (error) {
      console.error("[LLMDataGenerator] Error inicializando:", error);
    }
  }
  /**
   * Verifica si los datos necesitan ser actualizados
   */
  shouldUpdateData() {
    const lastUpdate = localStorage.getItem(this.lastUpdateKey);
    if (!lastUpdate)
      return true;
    const timeSinceUpdate = Date.now() - parseInt(lastUpdate);
    return timeSinceUpdate > this.updateInterval;
  }
  /**
   * Genera los datos LLM desde el CSV
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  async generateLLMData(csvData, config = {}) {
    try {
      console.log("[LLMDataGenerator] Generando datos LLM...");
      const llmData = {
        metadata: {
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          totalNodes: csvData.length,
          diagramTitle: config.title || "Diagrama",
          dataSource: "CSV",
          version: "1.0"
        },
        nodes: this.processNodes(csvData),
        clusters: this.identifyClusters(csvData),
        relationships: this.extractRelationships(csvData),
        summary: this.generateSummary(csvData, config)
      };
      const llmText = this.generateLLMText(llmData);
      this.storeData(llmData, llmText);
      console.log("[LLMDataGenerator] Datos LLM generados y almacenados exitosamente");
    } catch (error) {
      console.error("[LLMDataGenerator] Error generando datos LLM:", error);
    }
  }
  /**
   * Procesa los nodos del CSV
   * @param {Array} csvData - Datos del CSV
   */
  processNodes(csvData) {
    return csvData.map((row, index) => {
      const node = {
        id: row.id || row.Id || row.Node || `node_${index}`,
        name: row.name || row.Name || row.title || "Sin nombre",
        type: row.type || row.Type || "default",
        icon: row.icon || row.Icon || "detail",
        parent: row.parent || row.Parent || null,
        img: row.img || row.Img || null,
        description: row.description || row.Description || "",
        category: row.category || row.Category || "",
        status: row.status || row.Status || "active",
        priority: row.priority || row.Priority || "medium",
        tags: row.tags || row.Tags || "",
        url: row.url || row.Url || row.link || row.Link || "",
        notes: row.notes || row.Notes || "",
        // Incluir todos los campos adicionales
        ...this.extractAdditionalFields(row)
      };
      return node;
    });
  }
  /**
   * Extrae campos adicionales del CSV
   * @param {Object} row - Fila del CSV
   */
  extractAdditionalFields(row) {
    const additionalFields = {};
    const excludeFields = [
      "id",
      "Id",
      "Node",
      "name",
      "Name",
      "title",
      "type",
      "Type",
      "icon",
      "Icon",
      "parent",
      "Parent",
      "img",
      "Img",
      "description",
      "Description",
      "category",
      "Category",
      "status",
      "Status",
      "priority",
      "Priority",
      "tags",
      "Tags",
      "url",
      "Url",
      "link",
      "Link",
      "notes",
      "Notes"
    ];
    Object.keys(row).forEach((key) => {
      if (!excludeFields.includes(key) && row[key] !== void 0 && row[key] !== "") {
        additionalFields[key] = row[key];
      }
    });
    return additionalFields;
  }
  /**
   * Identifica clusters basados en la estructura jerárquica
   * @param {Array} csvData - Datos del CSV
   */
  identifyClusters(csvData) {
    const clusters = {};
    csvData.forEach((row) => {
      const parentId = row.parent || row.Parent;
      if (parentId) {
        if (!clusters[parentId]) {
          clusters[parentId] = {
            id: parentId,
            name: this.findParentName(csvData, parentId),
            children: [],
            childCount: 0
          };
        }
        clusters[parentId].children.push(row.id || row.Id || row.Node);
        clusters[parentId].childCount++;
      }
    });
    return Object.values(clusters);
  }
  /**
   * Encuentra el nombre del padre
   * @param {Array} csvData - Datos del CSV
   * @param {string} parentId - ID del padre
   */
  findParentName(csvData, parentId) {
    const parent = csvData.find(
      (row) => (row.id || row.Id || row.Node) === parentId
    );
    return parent ? parent.name || parent.Name || parent.title || parentId : parentId;
  }
  /**
   * Extrae relaciones entre nodos
   * @param {Array} csvData - Datos del CSV
   */
  extractRelationships(csvData) {
    const relationships = [];
    csvData.forEach((row) => {
      const parentId = row.parent || row.Parent;
      const nodeId = row.id || row.Id || row.Node;
      if (parentId && nodeId) {
        relationships.push({
          from: parentId,
          to: nodeId,
          type: "parent-child",
          relationship: "hierarchy"
        });
      }
    });
    return relationships;
  }
  /**
   * Genera un resumen del diagrama
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  generateSummary(csvData, config) {
    const totalNodes = csvData.length;
    const nodesWithParents = csvData.filter((row) => row.parent || row.Parent).length;
    const rootNodes = totalNodes - nodesWithParents;
    const categories = {};
    const types = {};
    const statuses = {};
    csvData.forEach((row) => {
      const category = row.category || row.Category || "Sin categoría";
      const type = row.type || row.Type || "default";
      const status = row.status || row.Status || "active";
      categories[category] = (categories[category] || 0) + 1;
      types[type] = (types[type] || 0) + 1;
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return {
      totalNodes,
      rootNodes,
      childNodes: nodesWithParents,
      categories: Object.keys(categories).length,
      types: Object.keys(types).length,
      statuses: Object.keys(statuses).length,
      topCategories: Object.entries(categories).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count2]) => ({ name, count: count2 })),
      topTypes: Object.entries(types).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count2]) => ({ name, count: count2 }))
    };
  }
  /**
   * Genera texto plano para LLMs
   * @param {Object} llmData - Datos estructurados
   */
  generateLLMText(llmData) {
    let text = `# ${llmData.metadata.diagramTitle}

`;
    text += `## Resumen del Diagrama
`;
    text += `- Total de nodos: ${llmData.summary.totalNodes}
`;
    text += `- Nodos raíz: ${llmData.summary.rootNodes}
`;
    text += `- Nodos hijos: ${llmData.summary.childNodes}
`;
    text += `- Categorías: ${llmData.summary.categories}
`;
    text += `- Tipos: ${llmData.summary.types}

`;
    text += `## Categorías Principales
`;
    llmData.summary.topCategories.forEach((cat) => {
      text += `- ${cat.name}: ${cat.count} nodos
`;
    });
    text += `
`;
    text += `## Tipos Principales
`;
    llmData.summary.topTypes.forEach((type) => {
      text += `- ${type.name}: ${type.count} nodos
`;
    });
    text += `
`;
    text += `## Clusters y Jerarquías
`;
    llmData.clusters.forEach((cluster) => {
      text += `### Cluster: ${cluster.name} (ID: ${cluster.id})
`;
      text += `- Nodos hijos: ${cluster.childCount}
`;
      text += `- IDs de hijos: ${cluster.children.join(", ")}

`;
    });
    text += `## Nodos Detallados
`;
    llmData.nodes.forEach((node) => {
      text += `### ${node.name} (ID: ${node.id})
`;
      text += `- Tipo: ${node.type}
`;
      text += `- Icono: ${node.icon}
`;
      if (node.parent)
        text += `- Padre: ${node.parent}
`;
      if (node.description)
        text += `- Descripción: ${node.description}
`;
      if (node.category)
        text += `- Categoría: ${node.category}
`;
      if (node.status)
        text += `- Estado: ${node.status}
`;
      if (node.priority)
        text += `- Prioridad: ${node.priority}
`;
      if (node.tags)
        text += `- Etiquetas: ${node.tags}
`;
      if (node.url)
        text += `- URL: ${node.url}
`;
      if (node.notes)
        text += `- Notas: ${node.notes}
`;
      Object.keys(node).forEach((key) => {
        if (![
          "id",
          "name",
          "type",
          "icon",
          "parent",
          "img",
          "description",
          "category",
          "status",
          "priority",
          "tags",
          "url",
          "notes"
        ].includes(key)) {
          text += `- ${key}: ${node[key]}
`;
        }
      });
      text += `
`;
    });
    text += `## Relaciones
`;
    llmData.relationships.forEach((rel) => {
      text += `- ${rel.from} → ${rel.to} (${rel.type})
`;
    });
    text += `
---
`;
    text += `Generado automáticamente el ${llmData.metadata.generatedAt}
`;
    text += `Fuente: ${llmData.metadata.dataSource}
`;
    return text;
  }
  /**
   * Almacena los datos en localStorage
   * @param {Object} llmData - Datos estructurados
   * @param {string} llmText - Texto plano para LLMs
   */
  storeData(llmData, llmText) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(llmData));
      localStorage.setItem(`${this.storageKey}_text`, llmText);
      localStorage.setItem(this.lastUpdateKey, Date.now().toString());
      console.log("[LLMDataGenerator] Datos almacenados en localStorage");
    } catch (error) {
      console.error("[LLMDataGenerator] Error almacenando datos:", error);
    }
  }
  /**
   * Obtiene los datos LLM almacenados
   */
  getStoredData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const text = localStorage.getItem(`${this.storageKey}_text`);
      if (data && text) {
        return {
          structured: JSON.parse(data),
          text
        };
      }
      return null;
    } catch (error) {
      console.error("[LLMDataGenerator] Error obteniendo datos almacenados:", error);
      return null;
    }
  }
  /**
   * Programa actualización en segundo plano
   * @param {Array} csvData - Datos del CSV
   * @param {Object} config - Configuración del diagrama
   */
  scheduleBackgroundUpdate(csvData, config) {
    setInterval(() => {
      if (this.shouldUpdateData()) {
        console.log("[LLMDataGenerator] Actualización en segundo plano...");
        this.generateLLMData(csvData, config);
      }
    }, this.updateInterval);
  }
  /**
   * Limpia los datos almacenados
   */
  clearStoredData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(`${this.storageKey}_text`);
      localStorage.removeItem(this.lastUpdateKey);
      console.log("[LLMDataGenerator] Datos limpiados de localStorage");
    } catch (error) {
      console.error("[LLMDataGenerator] Error limpiando datos:", error);
    }
  }
  /**
   * Exporta los datos como archivo descargable
   */
  exportLLMFile() {
    try {
      const storedData = this.getStoredData();
      if (!storedData) {
        console.warn("[LLMDataGenerator] No hay datos para exportar");
        return;
      }
      const blob = new Blob([storedData.text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "context.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("[LLMDataGenerator] Archivo context.md exportado");
    } catch (error) {
      console.error("[LLMDataGenerator] Error exportando archivo:", error);
    }
  }
}
class XDiagrams {
  constructor(config) {
    this.config = {
      url: null,
      title: "Diagrams",
      logo: "img/logo.svg",
      spacing: 80,
      verticalSpacing: 170,
      linearSpacing: 30,
      branchedSpacing: 80,
      nodeWidth: 100,
      nodeHeight: 125,
      treeSpacing: 100,
      clustersPerRow: "4 5 5 5",
      clusterGapX: 120,
      clusterGapY: 120,
      defaultIcon: "detail",
      showThemeToggle: false,
      transitionDuration: {
        click: 1e3,
        tab: 1500,
        reset: 3e3,
        resize: 300
      },
      initialZoom: {
        scale: 0.95,
        padding: 0.05
      },
      fitOnResize: true,
      textConfig: {
        maxWidth: 80,
        maxLines: 2,
        fontSize: 8,
        nodeNameFontSize: 9,
        lineHeight: 1.2,
        fontFamily: "Arial, sans-serif",
        textAnchor: "middle",
        dominantBaseline: "middle",
        ellipsis: "...",
        fontWeight: "bold"
      },
      linkConfig: {
        cornerRadius: 8,
        verticalTolerance: 5
      },
      selectedNode: {
        stroke: "#007bff",
        strokeWidth: 6,
        fill: "#E0FFFF"
      },
      ...config
    };
    this.globalTrees = [];
    this.globalContainer = null;
    this.clusterPositions = /* @__PURE__ */ new Map();
    this.uiManager = new XDiagramsUIManager();
    this.svgManager = new XDiagramsSVGManager();
    this.textHandler = new XDiagramsTextHandler(this.config.textConfig);
    this.thumbs = new XDiagramsThumbs({
      defaultIcon: this.config.defaultIcon
    });
    this.navigation = new XDiagramsNavigation(this);
    this.loader = new XDiagramsLoader();
    this.diagramRenderer = new XDiagramsDiagramRenderer(this);
    this.hierarchyBuilder = new XDiagramsHierarchyBuilder();
    this.diagramManager = new XDiagramsDiagramManager(this);
    this.llmDataGenerator = new XDiagramsLLMDataGenerator();
    this.svgManager.ensureDiagramHidden();
    this.diagramManager.setupEventListeners();
  }
  // Métodos delegados al Diagram Manager
  async initDiagram() {
    return this.diagramManager.initDiagram();
  }
  clearCacheAndReload() {
    return this.diagramManager.clearCacheAndReload();
  }
  async reloadDiagram() {
    return this.diagramManager.reloadDiagram();
  }
  // Métodos delegados al diagram-renderer
  calculateDiagramBounds() {
    return this.diagramRenderer.calculateDiagramBounds();
  }
  zoomToNode(nodeGroup, node, isClickNavigation = false) {
    return this.diagramRenderer.zoomToNode(nodeGroup, node, isClickNavigation);
  }
  applyInitialZoomImmediate(container, width, height) {
    return this.diagramRenderer.applyInitialZoomImmediate(container, width, height);
  }
  // Métodos delegados al Navigation
  getCurrentZoom() {
    return this.navigation.getCurrentZoom();
  }
  // Métodos delegados al SVG Manager
  createDiagram() {
    return this.svgManager.createDiagram();
  }
  ensureDiagramHidden() {
    return this.svgManager.ensureDiagramHidden();
  }
  showDiagram() {
    return this.svgManager.showDiagram();
  }
  hideDiagram() {
    return this.svgManager.hideDiagram();
  }
  clearDiagram() {
    return this.svgManager.clearDiagram();
  }
  getDiagram() {
    return this.svgManager.getDiagram();
  }
  getContainer() {
    return this.svgManager.getContainer();
  }
  getDiagramDimensions() {
    return this.svgManager.getDiagramDimensions();
  }
  // Métodos delegados al Text Handler
  renderText(container, text, options = {}) {
    return this.textHandler.renderText(container, text, options);
  }
  renderNodeText(container, text, x, y, options = {}) {
    return this.textHandler.renderNodeText(container, text, x, y, options);
  }
  renderNodeTextCentered(container, text, x, y, options = {}) {
    return this.textHandler.renderNodeTextCentered(container, text, x, y, options);
  }
  updateTextConfig(newConfig) {
    return this.textHandler.updateConfig(newConfig);
  }
  // Métodos delegados al UI Manager (InfoPanel)
  updateInfoPanel(transform2) {
    return this.uiManager.updateInfoPanel(transform2);
  }
  openInfoPanel(nodeData, diagramConfig = {}) {
    return this.uiManager.openInfoPanel(nodeData, diagramConfig);
  }
  closeInfoPanel() {
    return this.uiManager.closeInfoPanel();
  }
  // Acceso directo a los submódulos para casos específicos
  get svgManagerInstance() {
    return this.svgManager;
  }
  get textHandlerInstance() {
    return this.textHandler;
  }
  get uiManagerInstance() {
    return this.uiManager;
  }
  get diagramManagerInstance() {
    return this.diagramManager;
  }
  get llmDataGeneratorInstance() {
    return this.llmDataGenerator;
  }
}
class ThemeManager {
  constructor(options = {}) {
    this.currentTheme = "dark";
    this.storageKey = "xdiagrams-theme";
    this.showThemeToggle = options.showThemeToggle !== false;
    this.init();
  }
  init() {
    this.loadSavedTheme();
    this.applyTheme(this.currentTheme);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.createThemeToggle();
      });
    } else {
      this.createThemeToggle();
    }
    setTimeout(() => {
      if (!document.getElementById("theme-toggle")) {
        this.createThemeToggle();
      }
    }, 500);
    this.integrateWithXDiagrams();
  }
  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        this.currentTheme = savedTheme;
      } else {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.currentTheme = "dark";
        }
      }
    } catch (error) {
      console.warn("No se pudo cargar el tema guardado:", error);
    }
  }
  // Función para limpiar el tema guardado y usar el tema por defecto
  clearSavedTheme() {
    try {
      localStorage.removeItem(this.storageKey);
      this.currentTheme = "dark";
      this.applyTheme("dark");
      console.log("🎨 Tema guardado limpiado, aplicando tema dark por defecto");
    } catch (error) {
      console.warn("No se pudo limpiar el tema guardado:", error);
    }
  }
  createThemeToggle() {
    if (!this.showThemeToggle) {
      return;
    }
    if (document.getElementById("theme-toggle")) {
      return;
    }
    let themeControls = document.querySelector(".theme-controls");
    if (!themeControls) {
      themeControls = document.createElement("div");
      themeControls.className = "theme-controls";
      themeControls.style.position = "fixed";
      themeControls.style.top = "20px";
      themeControls.style.right = "20px";
      themeControls.style.zIndex = "1000";
      document.body.appendChild(themeControls);
    }
    if (themeControls.querySelector("#theme-toggle")) {
      return;
    }
    const toggleButton = document.createElement("button");
    toggleButton.id = "theme-toggle";
    toggleButton.className = "theme-toggle";
    toggleButton.title = "Cambiar tema";
    toggleButton.innerHTML = `
      <svg class="theme-icon sun-icon" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
        <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </g>
      </svg>
      <svg class="theme-icon moon-icon" width="18" height="18" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"></path>
      </svg>
    `;
    toggleButton.addEventListener("click", () => {
      this.toggleTheme();
    });
    toggleButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleTheme();
      }
    });
    themeControls.appendChild(toggleButton);
  }
  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }
  setTheme(theme) {
    if (theme !== "light" && theme !== "dark") {
      console.warn("Tema no válido:", theme);
      return;
    }
    this.currentTheme = theme;
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn("No se pudo guardar el tema:", error);
    }
    this.applyTheme(theme);
  }
  applyTheme(theme) {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
    this.updateToggleButton(theme);
    this.dispatchThemeChangeEvent(theme);
  }
  updateToggleButton(theme) {
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
      if (theme === "dark") {
        toggleButton.classList.add("dark-mode");
      } else {
        toggleButton.classList.remove("dark-mode");
      }
    }
  }
  // Método para mostrar/ocultar el toggle dinámicamente
  setThemeToggleVisibility(show) {
    this.showThemeToggle = show;
    const toggleButton = document.getElementById("theme-toggle");
    const themeControls = document.querySelector(".theme-controls");
    if (show) {
      if (!toggleButton) {
        this.createThemeToggle();
      }
      if (themeControls) {
        themeControls.style.display = "flex";
      }
    } else {
      if (toggleButton) {
        toggleButton.remove();
      }
      if (themeControls) {
        themeControls.style.display = "none";
      }
    }
  }
  dispatchThemeChangeEvent(theme) {
    const event2 = new CustomEvent("themechange", {
      detail: { theme }
    });
    document.dispatchEvent(event2);
  }
  getCurrentTheme() {
    return this.currentTheme;
  }
  isLightTheme() {
    return this.currentTheme === "light";
  }
  isDarkTheme() {
    return this.currentTheme === "dark";
  }
  // Método para integrar con el sistema de XDiagrams
  integrateWithXDiagrams() {
    document.addEventListener("diagram-ready", () => {
      this.ensureToggleVisibility();
    });
    if (document.readyState === "complete") {
      this.ensureToggleVisibility();
    } else {
      window.addEventListener("load", () => {
        this.ensureToggleVisibility();
      });
    }
  }
  ensureToggleVisibility() {
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
      toggleButton.style.display = "flex";
      toggleButton.style.visibility = "visible";
      toggleButton.style.opacity = "1";
    }
  }
}
function initThemes(options = {}) {
  const themeManager = new ThemeManager(options);
  window.ThemeManager = themeManager;
  return themeManager;
}
if (typeof window !== "undefined") {
  if (!window.ThemeManager) {
    const config = window.$xDiagrams || {};
    const themeOptions = {
      showThemeToggle: config.showThemeToggle !== false
    };
    initThemes(themeOptions);
  }
}
if (typeof window !== "undefined") {
  let initializeDiagram = function() {
    const config2 = window.$xDiagrams || {};
    if (Object.keys(config2).length > 0) {
      try {
        const diagram = new XDiagrams(config2);
        diagram.initDiagram();
        window.$xDiagrams = {
          ...config2,
          instance: diagram,
          navigation: diagram.navigation,
          core: diagram,
          uiManager: diagram.uiManager,
          themeManager,
          // Métodos para acceso a datos LLM
          getLLMData: () => diagram.core.llmDataGenerator.getStoredData(),
          exportLLMFile: () => diagram.core.llmDataGenerator.exportLLMFile(),
          clearLLMData: () => diagram.core.llmDataGenerator.clearStoredData()
        };
        diagram.navigation.setupResizeHandler();
      } catch (error) {
        console.error("❌ [XDiagrams] Error al inicializar diagrama:", error);
      }
    }
  };
  window.XDiagramsLoader = XDiagramsLoader;
  window.XDiagramsCache = XDiagramsCache;
  window.XDiagramsThumbs = XDiagramsThumbs;
  window.XDiagramsTextHandler = XDiagramsTextHandler;
  window.XDiagramsNavigation = XDiagramsNavigation;
  window.XDiagramsUIManager = XDiagramsUIManager;
  window.XDiagrams = XDiagrams;
  window.xDiagramsLoader = new XDiagramsLoader();
  const config = window.$xDiagrams || {};
  const themeOptions = {
    showThemeToggle: config.showThemeToggle !== false
  };
  const themeManager = initThemes(themeOptions);
  window.ThemeManager = themeManager;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDiagram);
  } else {
    initializeDiagram();
  }
}
export {
  ThemeManager,
  XDiagrams,
  XDiagramsCache,
  XDiagramsLoader,
  XDiagramsNavigation,
  XDiagramsTextHandler,
  XDiagramsThumbs,
  XDiagramsUIManager,
  initThemes
};

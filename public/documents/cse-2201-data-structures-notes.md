# CSE-2201: Data Structures and Algorithms

CampusOS demo study notes · October 2026

## 1. Complexity quick reference

| Operation | Array | Linked list | Hash table | Balanced search tree |
| --- | ---: | ---: | ---: | ---: |
| Index lookup | O(1) | O(n) | — | — |
| Search | O(n) | O(n) | O(1) average | O(log n) |
| Insert at front | O(n) | O(1) | — | — |
| Insert by key | — | — | O(1) average | O(log n) |

Big-O describes growth as the input size grows. It does not include constants, and average-case hash-table performance assumes a good hash function and a controlled load factor.

## 2. Stacks and queues

A stack is last-in, first-out. `push` and `pop` take O(1) time. Use a stack for function calls, depth-first search, undo history, and parsing nested expressions.

A queue is first-in, first-out. Enqueue and dequeue should take O(1) time with a linked queue or circular buffer. Use a queue for breadth-first search, task scheduling, and request processing.

## 3. Trees and graphs

In a balanced binary search tree, each left subtree contains smaller keys and each right subtree contains larger keys. Search, insertion, and removal take O(log n) while the tree stays balanced; an unbalanced tree can degrade to O(n).

Breadth-first search explores a graph one layer at a time using a queue. Depth-first search follows a path before backtracking and uses a stack or recursion. With adjacency lists, both run in O(V + E), where V is the number of vertices and E is the number of edges.

## 4. Sorting summary

- Merge sort: O(n log n) in all cases; stable; needs O(n) extra memory.
- Quicksort: O(n log n) average, O(n²) worst case; usually in place.
- Heap sort: O(n log n) worst case; in place; not stable.
- Insertion sort: O(n²) average; efficient for small or nearly sorted inputs.

## 5. Review exercise

Given an unsorted list of n integers, explain how you would return the k largest values. A min-heap of size k uses O(n log k) time and O(k) extra space. For small k, this is often better than sorting the whole list in O(n log n).

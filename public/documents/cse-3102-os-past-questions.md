# CSE-3102: Operating Systems Review Questions

CampusOS demo practice set · October 2026

These are original practice questions for the demo archive, not official past papers.

## Section A — Processes and scheduling

1. Distinguish a process from a thread. Give one situation where threads share resources and one where processes provide better isolation.
2. For jobs A(AT=0, BT=5), B(AT=1, BT=3), and C(AT=2, BT=1), draw the non-preemptive FCFS schedule and calculate each job’s waiting time and turnaround time.
3. Explain the difference between preemptive and non-preemptive scheduling. Name a metric that can improve while another gets worse.

## Section B — Synchronization and deadlocks

4. What race condition can occur when two threads increment a shared counter without a lock?
5. State the four necessary conditions for deadlock. Explain how preventing any one condition can prevent deadlock.
6. A semaphore starts at 1. Show how two threads use `wait` and `signal` to protect a critical section.

## Section C — Memory management

7. With 4 KiB pages, how many pages are needed for a 25 KiB process? How much internal fragmentation can the final page contain?
8. Compare paging with segmentation. What problem does a TLB reduce?
9. For the reference string `1, 2, 3, 1, 4, 2, 5` and three frames, count FIFO page faults.

## Section D — Storage and files

10. Compare contiguous, linked, and indexed file allocation. Give one advantage and one limitation of each.
11. Explain why a journaling file system can recover more quickly after an unexpected shutdown.

## Answer outline

2. FCFS order is A, B, C. Waiting times are A=0, B=4, C=6; turnaround times are A=5, B=7, C=7.

7. The process needs 7 pages. The final page has 3 KiB unused.

8. Paging uses fixed-size blocks; segmentation uses variable-size logical regions. A TLB caches page-table translations.

9. FIFO incurs 6 faults for this reference string with three frames.

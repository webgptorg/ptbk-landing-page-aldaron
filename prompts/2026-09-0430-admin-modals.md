[ ]

[✨😫] In the admin, use the popup modals

- There are a lot of places in the admin where there is in-line editing of the things, which is not very user friendly.
- Everything which is being edited, or when creating new items, pop up the modal with the thing.
- You are working with page `/admin`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
    - Reuse the same pattern, code and components across entire admin.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)


---

[ ]

[✨😫] In admin do not use popup modal in some places

- In theese places popup modal does not make sence:
    - https://www.ptbk.io/admin/workshops?artopts=off&tab=settings - "Upravit Nastavení" - it should be just on the page, maybe the subsetting should be under popup modals.
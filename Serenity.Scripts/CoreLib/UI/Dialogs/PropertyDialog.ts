﻿namespace Serenity {

    @Decorators.registerClass('Serenity.PropertyDialog')
    export class PropertyDialog<TItem, TOptions> extends TemplatedDialog<TOptions> {
        protected _entity: TItem;
        protected _entityId: any;

        constructor(opt?: TOptions) {
            super(opt);

            if (!this.isAsyncWidget()) {
                this.initPropertyGrid();
                this.loadInitialEntity();
            }
        }

        destroy() {
            if (this.propertyGrid) {
                this.propertyGrid.destroy();
                this.propertyGrid = null;
            }

            if (this.validator) {
                this.byId('Form').remove();
                this.validator = null;
            }

            super.destroy();
        }

        protected initPropertyGridAsync() {
            return Promise.resolve().then(() => {
                var pgDiv = this.byId('PropertyGrid');
                if (pgDiv.length <= 0) {
                    return Promise.resolve();
                }
                return this.getPropertyGridOptionsAsync().then(pgOptions => {
                    this.propertyGrid = new Serenity.PropertyGrid(pgDiv, pgOptions);
                    if (this.element.closest('.ui-dialog').hasClass('s-Flexify')) {
                        this.propertyGrid.element.children('.categories').flexHeightOnly(1);
                    }
                    return this.propertyGrid.initialize();
                });
            });
        }

        protected getDialogOptions() {
            var opt = super.getDialogOptions();
            opt.buttons = this.getDialogButtons();
            opt.width = 400;
            return opt;
        }

        protected getDialogButtons(): JQueryUI.DialogButtonOptions[] {
            return [{
                text: Q.text('Dialogs.OkButton'),
                click: () => this.okClick()
            }, {
                text: Q.text('Dialogs.CancelButton'),
                click: () => this.cancelClick()
            }];
        }

        protected okClick() {
            if (!this.validateBeforeSave()) {
                return;
            }

            this.okClickValidated();
        }

        protected okClickValidated() {
            this.dialogClose();
        }

        protected cancelClick() {
            this.dialogClose();
        }

        protected initPropertyGrid() {
            var pgDiv = this.byId('PropertyGrid');
            if (pgDiv.length <= 0) {
                return;
            }
            var pgOptions = this.getPropertyGridOptions();
            this.propertyGrid = (new Serenity.PropertyGrid(pgDiv, pgOptions)).init(null);
            if (this.element.closest('.ui-dialog').hasClass('s-Flexify')) {
                this.propertyGrid.element.children('.categories').flexHeightOnly(1);
            }
        }

        protected getFormKey(): string {
            var attributes = (ss as any).getAttributes(
                (ss as any).getInstanceType(this), Serenity.FormKeyAttribute, true);
            if (attributes.length >= 1) {
                return attributes[0].value;
            }
            else {
                var name = (ss as any).getTypeFullName((ss as any).getInstanceType(this));
                var px = name.indexOf('.');
                if (px >= 0) {
                    name = name.substring(px + 1);
                }
                if (Q.endsWith(name, 'Dialog')) {
                    name = name.substr(0, name.length - 6);
                }
                else if (Q.endsWith(name, 'Panel')) {
                    name = name.substr(0, name.length - 5);
                }
                return name;
            }
        }

        protected getPropertyGridOptions(): PropertyGridOptions {
            return {
                idPrefix: this.idPrefix,
                items: this.getPropertyItems(),
                mode: 1,
                useCategories: false,
                localTextPrefix: 'Forms.' + this.getFormKey() + '.'
            };
        }

        protected getPropertyGridOptionsAsync(): PromiseLike<PropertyGridOptions> {
            return this.getPropertyItemsAsync().then(propertyItems => {
                return {
                    idPrefix: this.idPrefix,
                    items: propertyItems, mode: 1,
                    useCategories: false,
                    localTextPrefix: 'Forms.' + this.getFormKey() + '.'
                };
            });
        }

        protected getPropertyItems(): PropertyItem[] {
            var formKey = this.getFormKey();
            return Q.getForm(formKey);
        }

        protected getPropertyItemsAsync(): PromiseLike<PropertyItem[]> {
            return Promise.resolve().then(() => {
                var formKey = this.getFormKey();
                return Q.getFormAsync(formKey);
            });
        }

        protected getSaveEntity(): TItem {
            var entity = new Object();
            if (this.propertyGrid) {
                this.propertyGrid.save(entity);
            }
            return entity as TItem;
        }

        protected initializeAsync(): PromiseLike<void> {
            return super.initializeAsync()
                .then(() => this.initPropertyGridAsync())
                .then(() => this.loadInitialEntity());
        }

        protected loadInitialEntity(): void {
            this.propertyGrid && this.propertyGrid.load(new Object());
        }

        protected get_entity() {
            return this._entity;
        }

        protected set_entity(value: TItem) {
            this._entity = Q.coalesce(value, new Object()) as any;
        }

        protected get_entityId() {
            return this._entityId;
        }

        protected set_entityId(value: any): void {
            this._entityId = value;
        }

        protected validateBeforeSave(): boolean {
            return this.validator.form();
        }

        protected updateTitle() {
        }

        protected propertyGrid: Serenity.PropertyGrid;
    }
}
import * as React from 'react';
import { WorkspaceNodeModel } from '../models/WorkspaceNodeModel';
import { WorkspaceEngine } from '../WorkspaceEngine';
import { PanelWidget } from './PanelWidget';
import { TrayWidget } from './TrayWidget';
import * as PropTypes from 'prop-types';
import { BaseWidget, BaseWidgetProps } from '@projectstorm/react-core';
import { DraggableWidget } from './DraggableWidget';

export interface WorkspaceWidgetProps extends BaseWidgetProps {
	model: WorkspaceNodeModel;
	engine: WorkspaceEngine;
}

export interface WorkspaceWidgetContext {
	workspace: WorkspaceWidget;
}

export class WorkspaceWidget extends BaseWidget<WorkspaceWidgetProps> {
	listener: () => any;
	floatingContainer: HTMLDivElement;

	static childContextTypes = {
		workspace: PropTypes.any
	};

	constructor(props: WorkspaceWidgetProps) {
		super('srw-workspace', props);
		this.state = {};
	}

	componentDidMount() {
		this.listener = this.props.engine.registerListener({
			repaint: () => {
				this.forceUpdate();
			}
		});
	}

	componentWillUnmount() {
		this.listener && this.listener();
	}

	isRight(element: HTMLDivElement) {
		return this.getRelativePosition(element).left > this.floatingContainer.offsetWidth / 2;
	}

	getRelativePosition(element: HTMLElement): { top: number; left: number; right: number } {
		let rect = element.getBoundingClientRect();
		let rect2 = this.floatingContainer.getBoundingClientRect();
		return {
			top: rect.top - rect2.top,
			left: rect.left - rect2.left,
			right: rect.right - rect2.right
		};
	}

	getChildContext(): WorkspaceWidgetContext {
		return { workspace: this };
	}

	render() {
		return (
			<div
				{...this.getProps()}
				onDragEnd={() => {
					this.props.engine.setDraggingNode(false);
				}}
				onDragEnter={event => {
					for (var i = 0; i < event.dataTransfer.types.length; ++i) {
						if (event.dataTransfer.types[i] === DraggableWidget.WORKSPACE_MIME) {
							event.preventDefault();
							this.props.engine.setDraggingNode(true);
							event.dataTransfer.dropEffect = 'move';
						}
					}
				}}>
				{this.props.engine.fullscreenModel ? (
					<PanelWidget model={this.props.engine.fullscreenModel} engine={this.props.engine} />
				) : (
					<TrayWidget root={true} node={this.props.model} engine={this.props.engine} />
				)}
				<div
					className={this.bem('__floating')}
					ref={ref => {
						this.floatingContainer = ref;
					}}></div>
			</div>
		);
	}
}

import { faList, faPlus } from "@fortawesome/free-solid-svg-icons";
import { template } from "lodash";
import React from "react";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { Validator } from "../data-structures/Validator";
import { nextUniqueId } from "../helper/IdHelpers";
import { Button } from "./common/Button";
import { ButtonContainer } from "./common/ButtonContainer";
import { ButtonIcon } from "./common/ButtonIcon";
import { Editable } from "./common/Editable";
import { ErrorDisplay } from "./common/ErrorDisplay";
import { Input } from "./common/Input";
import { IntegerInput } from "./common/IntegerInput";
import { SpaceContainer } from "./common/SpaceContainer";
import { ProbabilityInput } from "./inputs/ProbabilityInput";

interface Props {
    table: ProbabilityTable,
    nextDefaultOptionName: () => string,
    onChange?: (table: ProbabilityTable) => void,
    requestTabFocus: () => void,
    validator: Validator
}

interface State {
    showTableProperties: boolean,
    showProbabilitiesExceedOneError: boolean
}

export class ProbabilityTableContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showTableProperties: false,
            showProbabilitiesExceedOneError: false
        };
        
        this.validate = this.validate.bind(this);
    }
    
    componentDidMount() {
        this.props.validator.addValidation(this.validate);
    }
    
    componentWillUnmount() {
        this.props.validator.removeValidation(this.validate);
    }
    
    private updateItem(index: number, value: ProbabilityItem) {
        const newItems = [...this.props.table.items];
        newItems[index] = value;
        
        this.props.onChange?.({
            ...this.props.table,
            items: newItems
        });
    }
    
    private deleteItem(item: ProbabilityItem) {
        const newItems = this.props.table.items.filter(x => x !== item);
        
        this.props.onChange?.({
            ...this.props.table,
            items: newItems
        });
    }
    
    private createNewItem() {
        const item: ProbabilityItem = {
            id: nextUniqueId().toString(),
            name: this.props.nextDefaultOptionName(),
            probabilityDisplay: ""
        };
        return item;
    }
    
    private addNewItem() {
        const newItems = [...this.props.table.items, this.createNewItem()];
        this.props.onChange?.({
            ...this.props.table,
            items: newItems
        });
    }
    
    private validate() {
        const totalProbability = this.props.table.items.reduce((a, b) => a + b.probability!, 0);
        if (totalProbability > 1) {
            // TODO: Floating point error may cause probability to be slightly over 1,
            // need to take that into account
            this.setState({
                showProbabilitiesExceedOneError: true
            });
            this.props.requestTabFocus();
            return false;
        }
        
        return true;
    }
    
    render() {
        return (
            <SpaceContainer className="probability-table-component">
                {this.props.table.items.length > 0 &&
                <div>
                    {this.props.table.items.map((item, index) => (
                        <ProbabilityInput
                            key={item.id}
                            item={item}
                            onChange={item => this.updateItem(index, item)}
                            onDeleteRequest={() => this.deleteItem(item)}
                            requestTabFocus={this.props.requestTabFocus}
                            showDeleteButton={this.props.table.items.length >= 2}
                            validator={this.props.validator}
                        />
                    ))}
                </div>
                }
                {this.state.showProbabilitiesExceedOneError &&
                <div>
                    <ErrorDisplay>
                        The sum of all probabilities in the table should not exceed 100%.
                    </ErrorDisplay>
                </div>
                }
                <ButtonContainer>
                    <Button
                        icon={faPlus}
                        content="Add option"
                        onClick={() => this.addNewItem()}
                    />
                    <Button
                        icon={faList}
                        content="Properties"
                        onClick={() => this.setState({
                            showTableProperties: !this.state.showTableProperties
                        })}
                    />
                </ButtonContainer>
                {this.state.showTableProperties &&
                <SpaceContainer>
                    <div>
                        <label>Table name</label>
                        <Input
                            value={this.props.table.name}
                            onChange={e => this.props.onChange?.({
                                ...this.props.table,
                                name: e.target.value
                            })}
                        />
                    </div>
                    <div>
                        <label>Table rolls per iteration</label>
                        <IntegerInput
                            value={this.props.table.rollsPerIteration}
                            onChange={value => this.props.onChange?.({
                                ...this.props.table,
                                rollsPerIteration: value
                            })}
                        />
                    </div>
                </SpaceContainer>
                }
            </SpaceContainer>
        );
    }
}
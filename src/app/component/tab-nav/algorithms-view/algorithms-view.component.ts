import {Component, OnDestroy, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SelectItemGroup} from "primeng/api";
import {ConfService} from "../../../service/config/conf.service";
import {Algorithm} from "../../../model/Algorithm";
import {Subscription} from "rxjs";
import {Button} from "primeng/button";
import {StateService} from "../../../service/event/state.service";
import {NgClass} from "@angular/common";

/**
 * Component for the algorithms view.
 */
@Component({
  selector: 'app-algorithms-view',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    NgClass
  ],
  templateUrl: './algorithms-view.component.html',
  styleUrl: './algorithms-view.component.css'
})
export class AlgorithmsViewComponent implements OnInit, OnDestroy {
  private subscriptions!: Subscription;

  // Dropdown
  groupedAlgs?: SelectItemGroup[];
  selectedAlg = new FormControl(ConfService.DEFAULT_ALGORITHM);

  algorithmItems!: AlgorithmItem[];
  selectedAlgItem!: AlgorithmItem;

  // Algorithm mode state
  isAlgorithmModeActive: boolean = false;

  constructor(private stateService: StateService) {
  }

  ngOnInit(): void {
    this.groupedAlgs = [
      {
        label: 'Shortest Path Finding',
        items: [
          {label: 'Dijkstra\'s Algorithm', value: Algorithm.DIJKSTRA},
        ]
      },
      {
        label: 'Traversal',
        items: [
          {label: 'Depth First Search', value: Algorithm.DFS},
          {label: 'Breadth First Search', value: Algorithm.BFS},
        ]
      }
    ];

    this.algorithmItems = [
      {
        label: 'Dijkstra\'s Algorithm',
        id: Algorithm.DIJKSTRA,
        definition: 'TODO1',
        image: 'TODO1',
        description: 'TODO1'
      },
      {
        label: 'Depth First Search',
        id: Algorithm.DFS,
        definition: 'TODO2',
        image: 'TODO2',
        description: 'TODO2'
      },
      {
        label: 'Breadth First Search',
        id: Algorithm.BFS,
        definition: 'TODO3',
        image: 'TODO3',
        description: 'TODO3'
      }
    ];
    this.isAlgorithmModeActive = this.stateService.isAlgorithmModeActive();
    console.log('Algorithm mode active:', this.isAlgorithmModeActive);
    this.selectedAlgItem = this.algorithmItems.find(item => item.id === this.selectedAlg.value)!;

    // Init subscriptions
    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.selectedAlg.valueChanges.subscribe((value) => {
        this.selectedAlgItem = this.algorithmItems.find(item => item.id === value)!;
      })
    );
    // On enable algorithm mode
    this.subscriptions.add(
      this.stateService.algorithmModeStateChanged$.subscribe((value) => {
        if (this.isAlgorithmModeActive !== value) {
          this.toggleAlgorithmModeStyles(value);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onActivateAlgorithm() {
    const algorithm = this.selectedAlg.value!;
    this.stateService.activateAlgorithm(algorithm);
  }

  private toggleAlgorithmModeStyles(value: boolean) {
    this.isAlgorithmModeActive = value;
  }
}

/**
 * Interface for algorithm item
 */
export interface AlgorithmItem {
  label: string;
  id: string;
  definition: string;
  image: string;
  description: string;
}

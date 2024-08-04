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
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {GraphicalUtils} from "../../../utils/graphical-utils";

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

  constructor(private stateService: StateService,
              private sanitizer: DomSanitizer) {
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
        definition: this.sanitizer.bypassSecurityTrustHtml('<p>Dijkstra\'s algorithm is a graph search algorithm' +
          ' that finds <b>the shortest path</b> between a specified starting node and a target node in a weighted graph with' +
          ' non-negative edge weights. It uses a priority queue to explore the nearest unvisited nodes,' +
          ' updating the shortest known distances from the start node to each node until the shortest path to the' +
          ' target node is determined.</p>'),
        image: 'DijkstraAnimation.gif',
        description: this.sanitizer.bypassSecurityTrustHtml('<p>The Dijkstra algorithm can be initiated by' +
          ' <b>selecting two nodes</b> with a click or tap.' +
          ' Once selected, you can start the algorithm calculation. Upon completion of the calculation,' +
          ' you can control the animation playback using the player toolbar that appears.</p>' +
          '<br>' +
          '<b>Legend:</b>' +
          '<br>' +
          '<ul>' +
          '<li><i style="color: ' + GraphicalUtils.hexNumberToString(ConfService.ALGORITHM_SELECTION_COLOR) +
          '">Vertices/Edges</i> - Coloring of current steps of the algorithm.</li>' +
          '<li><i style="color: ' + GraphicalUtils.hexNumberToString(ConfService.ALGORITHM_PATH_COLOR) +
          '">Vertices/Edges</i> - Coloring of the shortest path.</li>' +
          '<li>Labels below vertices - The minimal distance to the node,' +
          ' calculated at each specific step of the algorithm.</li>' +
          '</ul>')
      },
      {
        label: 'Depth First Search',
        id: Algorithm.DFS,
        definition: this.sanitizer.bypassSecurityTrustHtml('<p>DFS is a <b>graph traversal</b> algorithm that' +
          ' explores as far as possible along each branch before backtracking. It starts from a given node' +
          ' (the root in tree structures) and explores each branch of the graph thoroughly before moving' +
          ' on to the next branch. DFS uses a stack data structure, either through recursion or an explicit' +
          ' stack, to keep track of the vertices to visit next.</p>'),
        image: 'DFSAnimation.gif',
        description: this.sanitizer.bypassSecurityTrustHtml('<p>The DFS algorithm can be started by' +
          ' <b>selecting a node</b> with a click or tap. After selecting the node, you can start the algorithm\'s' +
          ' calculation. Once the calculation is finished, you can manage the animation playback using the' +
          ' player toolbar that appears.</p>' +
          '<br>' +
          '<b>Legend:</b>' +
          '<br>' +
          '<ul>' +
          '<li><i style="color: ' + GraphicalUtils.hexNumberToString(ConfService.ALGORITHM_SELECTION_COLOR) +
          '">Vertices/Edges</i> - Coloring of current steps of the algorithm.</li>' +
          '<li>Labels below vertices - order of node visiting.</li>' +
          '</ul>')
      },
      {
        label: 'Breadth First Search',
        id: Algorithm.BFS,
        definition: this.sanitizer.bypassSecurityTrustHtml('<p>Breadth-First Search (BFS) is a <b>graph' +
          ' traversal</b> algorithm that explores nodes level by level, starting from a given node. It visits all' +
          ' neighbors at the present depth before moving on to nodes at the next depth level, ensuring the' +
          ' shortest path in terms of the number of edges from the starting node to each node.</p>'),
        image: 'BFSAnimation.gif',
        description: this.sanitizer.bypassSecurityTrustHtml('<p>The BFS algorithm can be started by' +
          ' <b>selecting a node</b> with a click or tap. After selecting the node, you can start the algorithm\'s' +
          ' calculation. Once the calculation is finished, you can manage the animation playback using the' +
          ' player toolbar that appears.</p>' +
          '<br>' +
          '<b>Legend:</b>' +
          '<br>' +
          '<ul>' +
          '<li><i style="color: ' + GraphicalUtils.hexNumberToString(ConfService.ALGORITHM_SELECTION_COLOR) +
          '">Vertices/Edges</i> - Coloring of current steps of the algorithm.</li>' +
          '<li>Labels below vertices - order of node visiting.</li>' +
          '</ul>')
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
    // On algorithm activation
    this.subscriptions.add(
      this.stateService.activateAlgorithm$.subscribe((value) => {
        this.selectedAlgItem = this.algorithmItems.find(item => item.id === value)!;
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
  definition: SafeHtml;
  image: string;
  description: SafeHtml;
}

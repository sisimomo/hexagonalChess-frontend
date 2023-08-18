import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PieceTypeMapper } from 'src/app/service/piece/mapper/pieceTypeMapper';
import { PieceSide, PieceType } from '../../common/engine/internal';
import { PieceComponent } from '../piece/piece.component';

export interface DialogData {
  pieceSide: PieceSide;
  selected?: PieceType;
}

@Component({
  selector: 'app-piece-type-dialog',
  templateUrl: './piece-type-dialog.dialog.html',
  styleUrls: ['./piece-type-dialog.dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    PieceComponent,
  ],
})
export class PieceTypeDialogDialog {
  constructor(
    public dialogRef: MatDialogRef<PieceTypeDialogDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  protected get pieceTypeEnum(): typeof PieceType {
    return PieceType;
  }

  protected get allPieceTypeEnums(): PieceType[] {
    return Object.values(PieceType).filter((p) => p !== PieceType.PAWN);
  }

  protected convertToString(pieceType: PieceType): string {
    const str = PieceTypeMapper.convertToDto(pieceType).toString();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onSelectCard(pieceType: PieceType) {
    this.data.selected = pieceType;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

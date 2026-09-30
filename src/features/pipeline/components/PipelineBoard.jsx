import { useState } from 'react';

import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';

import { PIPELINE_STAGES } from '../constants';
import { useDeals } from '../hooks/useDeals';
import { createDeal, groupDealsByStage } from '../utils/pipeline';
import { AddDealForm } from './AddDealForm';
import { PipelineColumn } from './PipelineColumn';
import styles from './PipelineBoard.module.css';

export function PipelineBoard() {
  const { deals, moveDeal, addDeal } = useDeals();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [dropTargetStageId, setDropTargetStageId] = useState(null);

  const columns = groupDealsByStage(deals, PIPELINE_STAGES);

  function handleAddDeal(values) {
    addDeal(createDeal(values));
    setIsAddFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Sales pipeline"
        description="Drag a card to another stage, or use the stage menu on a card."
        actions={
          <Button onClick={() => setIsAddFormOpen(true)} disabled={isAddFormOpen}>
            Add lead
          </Button>
        }
      />
      {isAddFormOpen && (
        <AddDealForm onSubmit={handleAddDeal} onCancel={() => setIsAddFormOpen(false)} />
      )}
      <div className={styles.board}>
        {columns.map((column) => (
          <PipelineColumn
            key={column.id}
            column={column}
            isDropTarget={dropTargetStageId === column.id}
            onDropTargetChange={setDropTargetStageId}
            onMoveDeal={moveDeal}
          />
        ))}
      </div>
    </>
  );
}

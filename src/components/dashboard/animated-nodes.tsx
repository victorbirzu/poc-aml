'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Check, CheckCircle, XCircle } from 'lucide-react';

const NODE_SIZE = 110;
const CONTAINER_SIZE = 450;

const Line = ({
  from,
  to,
  delay,
  color,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
  color: string;
}) => {
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  const length = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );

  return (
    <motion.div
      className={cn('absolute h-0.5 origin-left', color)}
      style={{
        top: `${from.y}px`,
        left: `${from.x}px`,
        rotate: `${angle}deg`,
        width: `${length}px`,
      }}
      initial={{ width: 0 }}
      animate={{ width: length }}
      transition={{ duration: 0.8, ease: 'easeInOut', delay }}
    />
  );
};

interface AnimatedNodesProps {
  onAnimationComplete: () => void;
  onNodeClick: (id?: number | string) => void;
  mainNodeLabel?: string | null;
  isApiProcessing: boolean;
  isApiCompleted: boolean;
  isApiError?: boolean;
  isNode1Processing?: boolean;
  isNode1Completed?: boolean;
  isNode1Error?: boolean;
  isNode2Processing?: boolean;
  isNode2Completed?: boolean;
  isNode2Error?: boolean;
}

export default function AnimatedNodes({
  onAnimationComplete,
  onNodeClick,
  mainNodeLabel,
  isApiProcessing,
  isApiCompleted,
  isApiError = false,
  isNode1Processing = false,
  isNode1Completed = false,
  isNode1Error = false,
  isNode2Processing = false,
  isNode2Completed = false,
  isNode2Error = false,
}: AnimatedNodesProps) {
  const [nodes, setNodes] = React.useState([
    { id: 0, spinning: true, completed: false, error: false, label: 'MD Justice systems', nodeId: '1' },
    { id: 1, spinning: true, completed: false, error: false, label: 'Screening', nodeId: '2' },
    { id: 2, spinning: true, completed: false, error: false, label: 'Reputational & Adverse Media', nodeId: '3' },
  ]);
  const [mainNodeCompleted, setMainNodeCompleted] = React.useState(false);

  React.useEffect(() => {
    // API-driven node 2 (Screening) animation
    if (isNode2Processing !== undefined || isNode2Completed !== undefined || isNode2Error !== undefined) {
      setNodes((prev) =>
        prev.map((n) => (n.id === 1 ? { ...n, spinning: isNode2Processing && !isNode2Error, completed: isNode2Completed && !isNode2Error, error: isNode2Error } : n))
      );
    }
  }, [isNode2Processing, isNode2Completed, isNode2Error]);

  React.useEffect(() => {
    // API-driven node 1 (MD Justice systems) animation
    if (isNode1Processing !== undefined || isNode1Completed !== undefined || isNode1Error !== undefined) {
      setNodes((prev) =>
        prev.map((n) => (n.id === 0 ? { ...n, spinning: isNode1Processing && !isNode1Error, completed: isNode1Completed && !isNode1Error, error: isNode1Error } : n))
      );
    }
  }, [isNode1Processing, isNode1Completed, isNode1Error]);

  React.useEffect(() => {
    // API-driven node 3 (Reputational & Adverse Media) animation
    setNodes((prev) =>
      prev.map((n) => (n.id === 2 ? { ...n, spinning: isApiProcessing && !isApiError, completed: isApiCompleted && !isApiError, error: isApiError } : n))
    );
  }, [isApiProcessing, isApiCompleted, isApiError]);

  React.useEffect(() => {
    const allCompleted = nodes.every((n) => n.completed);
    if (allCompleted) {
      setTimeout(() => {
        setMainNodeCompleted(true);
        onAnimationComplete();
      }, 500);
    } else {
        setMainNodeCompleted(false);
    }
  }, [nodes, onAnimationComplete]);


  const centerPoint = { x: CONTAINER_SIZE / 2, y: CONTAINER_SIZE / 2 };
  const radius = CONTAINER_SIZE / 2 - NODE_SIZE / 2 - 10;

  const nodePositions = Array.from({ length: 3 }).map((_, index) => {
    const angle = (index * 2 * Math.PI) / 3 - Math.PI / 2; // Start from top
    return {
      x: centerPoint.x + radius * Math.cos(angle) - NODE_SIZE / 2,
      y: centerPoint.y + radius * Math.sin(angle) - NODE_SIZE / 2,
    };
  });

  const mainNodeBorderColor = mainNodeCompleted
    ? 'border-green-500'
    : 'border-orange-500';

  return (
    <div className="relative mb-8 flex w-full items-center justify-center">
      <div
        className="relative"
        style={{ width: `${CONTAINER_SIZE}px`, height: `${CONTAINER_SIZE}px` }}
      >
        <AnimatePresence>
          {/* Lines Container */}
          <div key="lines">
            {nodePositions.map((pos, index) => (
              <Line
                key={`line-${index}`}
                from={centerPoint}
                to={{
                  x: pos.x + NODE_SIZE / 2,
                  y: pos.y + NODE_SIZE / 2,
                }}
                delay={0.5 + index * 0.1}
                color={
                  nodes[index].error ? 'bg-red-500' : 
                  nodes[index].completed ? 'bg-green-500' : 'bg-orange-500'
                }
              />
            ))}
          </div>

          {/* Nodes Container */}
          <div key="nodes">
            {/* Central Node */}
            <motion.div
              onClick={() => onNodeClick()}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'absolute flex items-center justify-center rounded-full border-4 bg-gray-200 text-lg font-bold text-gray-800 transition-colors duration-500 cursor-pointer text-center p-2',
                mainNodeBorderColor
              )}
              style={{
                left: centerPoint.x - NODE_SIZE / 2,
                top: centerPoint.y - NODE_SIZE / 2,
                height: `${NODE_SIZE}px`,
                width: `${NODE_SIZE}px`,
              }}
            >
              {mainNodeCompleted ? (
                <div className="flex flex-col items-center justify-center gap-1 opacity-80">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <span className="text-sm font-semibold">
                    {mainNodeLabel || 'Main'}
                  </span>
                </div>
              ) : (
                mainNodeLabel || 'Main'
              )}
            </motion.div>

            {/* Satellite Nodes */}
            {nodePositions.map((pos, index) => {
              const node = nodes[index];
              const borderColor = node.error
                ? 'border-red-500'
                : node.completed
                ? 'border-green-500'
                : 'border-orange-500';

              return (
                <motion.div
                  key={`node-${index}`}
                  onClick={() => onNodeClick(node.nodeId)}
                  initial={{
                    left: centerPoint.x - NODE_SIZE / 2,
                    top: centerPoint.y - NODE_SIZE / 2,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    left: pos.x,
                    top: pos.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: 0.3 + index * 0.1,
                  }}
                  className={cn(
                    'absolute flex flex-col items-center justify-center rounded-full border-4 bg-gray-200 text-gray-800 transition-colors duration-500 cursor-pointer text-center p-2',
                    borderColor,
                    node.label.length > 25 ? 'text-xs' : (node.label.length > 15 ? 'text-sm' : 'text-base'),
                    'font-semibold'
                  )}
                  style={{
                    height: `${NODE_SIZE}px`,
                    width: `${NODE_SIZE}px`,
                  }}
                >
                  <div className='flex flex-col items-center justify-center gap-1'>
                    {node.error && (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    {!node.error && node.spinning && (
                      <Loader className="h-8 w-8 animate-spin text-orange-500" />
                    )}
                    {!node.error && node.completed && (
                      <Check className="h-8 w-8 text-green-500" />
                    )}
                    <span>{node.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';

const PriorityCalculator = () => {
  const [tasks, setTasks] = useState('');
  const [step, setStep] = useState(1);
  const [taskList, setTaskList] = useState([]);
  const [showAllColumns, setShowAllColumns] = useState(false);

  const handleTasksInput = (e) => {
    setTasks(e.target.value);
  };

  const handleNextStep = () => {
    if (step === 1) {
      const newTaskList = tasks.split('\n').filter(task => task.trim() !== '');
      if (newTaskList.length > 0) {
        setTaskList(newTaskList.map(task => ({ 
          task, 
          importance: '', 
          dueDate: { type: '', value: '' }
        })));
        setStep(2);
      } else {
        alert('최소한 하나의 할 일을 입력해주세요.');
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleImportanceChange = (index, value) => {
    const newTaskList = [...taskList];
    newTaskList[index].importance = value;
    setTaskList(newTaskList);
  };

  const handleDueDateTypeChange = (index, type) => {
    const newTaskList = [...taskList];
    newTaskList[index].dueDate = { type, value: type === 'today' ? new Date().toISOString().split('T')[0] : '' };
    setTaskList(newTaskList);
  };

  const handleDueDateValueChange = (index, value) => {
    const newTaskList = [...taskList];
    newTaskList[index].dueDate.value = value;
    setTaskList(newTaskList);
  };

  const calculateUrgency = (dueDate) => {
    if (dueDate.type === 'daily') return 5;
    if (dueDate.type === 'asap') return 3;
    if (dueDate.type === 'today') return 1;
    if (dueDate.type === 'date') {
      const diff = Math.ceil((new Date(dueDate.value) - new Date()) / (1000 * 60 * 60 * 24));
      return diff > 10 ? 1 : 11 - diff;
    }
    if (dueDate.type === 'custom') return parseInt(dueDate.value) || 1;
    return 1;
  };

  const calculatedTasks = useMemo(() => {
    return taskList.map((task, index) => {
      const importance = parseInt(task.importance) || taskList.length;
      const urgency = calculateUrgency(task.dueDate);
      return {
        ...task,
        importance,
        urgency,
        priority: importance * urgency,
        priorityCalculation: `${importance} * ${urgency} = ${importance * urgency}`
      };
    }).sort((a, b) => a.priority - b.priority)
      .map((task, index) => ({ ...task, rank: index + 1 }));
  }, [taskList]);

  const availableImportanceValues = useMemo(() => {
    const allValues = new Set([...Array(taskList.length)].map((_, i) => String(i + 1)));
    taskList.forEach(task => {
      if (task.importance) {
        allValues.delete(task.importance);
      }
    });
    return Array.from(allValues);
  }, [taskList]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">할 일 우선순위 계산기</h1>
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">1단계: 할 일 입력</h2>
          <p className="mb-2">각 할 일을 새 줄로 구분하여 입력해주세요.</p>
          <textarea
            value={tasks}
            onChange={handleTasksInput}
            placeholder="할 일 1&#10;할 일 2&#10;할 일 3..."
            className="w-full h-40 p-2 border rounded mb-4"
          />
          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
              disabled
            >
              이전 단계
            </button>
            <button
              onClick={handleNextStep}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              다음 단계
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">2단계: 중요도와 마감일 입력</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">할 일</th>
                  <th className="border border-gray-300 p-2">중요도</th>
                  <th className="border border-gray-300 p-2">마감일</th>
                </tr>
              </thead>
              <tbody>
                {taskList.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{task.task}</td>
                    <td className="border border-gray-300 p-2">
                      <select 
                        value={task.importance} 
                        onChange={(e) => handleImportanceChange(index, e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">중요도 선택</option>
                        {availableImportanceValues.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                        {task.importance && (
                          <option value={task.importance}>{task.importance}</option>
                        )}
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={task.dueDate.type}
                        onChange={(e) => handleDueDateTypeChange(index, e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      >
                        <option value="">마감일 유형 선택</option>
                        <option value="today">오늘</option>
                        <option value="date">날짜</option>
                        <option value="asap">ASAP</option>
                        <option value="daily">매일</option>
                        <option value="custom">직접 입력</option>
                      </select>
                      {task.dueDate.type === 'date' && (
                        <input
                          type="date"
                          className="w-full p-2 border rounded"
                          value={task.dueDate.value}
                          onChange={(e) => handleDueDateValueChange(index, e.target.value)}
                        />
                      )}
                      {task.dueDate.type === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="w-full p-2 border rounded"
                          value={task.dueDate.value}
                          onChange={(e) => handleDueDateValueChange(index, e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              이전 단계
            </button>
            <button
              onClick={handleNextStep}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              결과 보기
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">3단계: 우선순위 결과</h2>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={showAllColumns}
                onChange={(e) => setShowAllColumns(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">모든 열 보기</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">순위</th>
                  <th className="border border-gray-300 p-2">할 일</th>
                  {showAllColumns && (
                    <>
                      <th className="border border-gray-300 p-2">중요도</th>
                      <th className="border border-gray-300 p-2">긴급도</th>
                      <th className="border border-gray-300 p-2">우선순위 계산</th>
                    </>
                  )}
                  <th className="border border-gray-300 p-2">마감일</th>
                </tr>
              </thead>
              <tbody>
                {calculatedTasks.map((task, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{task.rank}</td>
                    <td className="border border-gray-300 p-2">{task.task}</td>
                    {showAllColumns && (
                      <>
                        <td className="border border-gray-300 p-2">{task.importance}</td>
                        <td className="border border-gray-300 p-2">{task.urgency}</td>
                        <td className="border border-gray-300 p-2">{task.priorityCalculation}</td>
                      </>
                    )}
                    <td className="border border-gray-300 p-2">
                      {task.dueDate.type === 'today' && '오늘'}
                      {task.dueDate.type === 'date' && task.dueDate.value}
                      {task.dueDate.type === 'asap' && 'ASAP'}
                      {task.dueDate.type === 'daily' && '매일'}
                      {task.dueDate.type === 'custom' && `긴급도: ${task.dueDate.value}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              이전 단계
            </button>
            <button
              onClick={() => setStep(1)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              처음으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityCalculator;
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import * as fs from 'fs/promises';
import { DATABASE_PATH } from 'src/common/constants/global.constants';
import { TaskDto } from './dto/task.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class TasksService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(task: CreateTaskDto) {
    const tasks = await this.findAll();
    const id = crypto.randomUUID();

    const updatedTasks = [...tasks, { ...task, id }];

    await fs.writeFile(DATABASE_PATH, JSON.stringify(updatedTasks));

    this.eventEmitter.emit('TASK_CREATED', task);
  }

  async findAll(): Promise<CreateTaskDto[]> {
    const data = await fs.readFile(DATABASE_PATH);
    const tasks: CreateTaskDto[] = JSON.parse(data.toString());
    const mappedTasks = tasks.map((task) => ({ ...task }));

    return mappedTasks;
    // return tasks;
  }

  async findAllPriority() {
    const tasks = await this.findAll();

    return tasks.sort((a, b) => b.priority - a.priority);
  }
  async findAllSchedule() {
    const tasks = await this.findAll();

    return tasks.sort((a, b) => {
      const date1 = new Date(a.scheduledTime).getTime() || 0;
      const date2 = new Date(b.scheduledTime).getTime() || 0;

      return date2 - date1;
    });

    //return tasks.sort((a, b) => b.scheduledTime - a.scheduledTime);
  }

  async findOne(id: string) {
    const tasks = await this.findAll();

    const task = tasks.find((t) => t.id === id);

    if (!task) throw new NotFoundException('error al buscar usuario');

    return task;
    // return `This action returns a #${id} task`;
  }

  async update(id: string, task: UpdateTaskDto) {
    const tasks = await this.findAll();
    const index = tasks.findIndex((itemTask) => itemTask.id == id);
    console.log(tasks[index]);

    if (index == -1) throw new BadRequestException('id no valido');
    // console.log(tasks);
    tasks[index] = { ...tasks[index], ...task };
    // console.log(tasks);

    await fs.writeFile(DATABASE_PATH, JSON.stringify(tasks));
    return tasks[index];
    // return `This action updates a #${id} task`;
  }

  async remove(id: string) {
    const tasks = await this.findAll();
    const index = tasks.findIndex((t) => t.id == id);
    tasks.splice(index, 1);
    await fs.writeFile(DATABASE_PATH, JSON.stringify(tasks));

    if (!tasks[index]) throw new BadRequestException('error al buscar task');

    return tasks;
    // return `This action removes a #${id} task`;
  }

  getFecha(): string {
    return new Date().toString();
  }
}
